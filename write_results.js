const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// ACOMPANHAMENTO OFERTAS — rowIdx (0-based), colDia (0-based)
const acompUpdates = [
  { rowIdx: 16, colDia: 13, produto: 'Próxy Enzimático',        valor: 7   },
  { rowIdx: 17, colDia: 13, produto: 'Médoto P.E.I',            valor: 0   },
  { rowIdx: 18, colDia: 13, produto: 'Aprovação Concursos',     valor: 110 },
  { rowIdx: 19, colDia: 13, produto: 'Album Casamento',         valor: 10  },
  { rowIdx: 20, colDia: 13, produto: 'Pacotes de músicas',      valor: 22  },
  { rowIdx: 21, colDia: 13, produto: '200 dinamicas cristã',    valor: 11  },
  { rowIdx: 22, colDia: 13, produto: 'Venda Físíca (cristã)',   valor: 96  },
  { rowIdx: 23, colDia: 13, produto: 'Bonecos bíblicos',        valor: 31  },
  { rowIdx: 24, colDia: 13, produto: 'Eternizando memórias',    valor: 0   },
  { rowIdx: 25, colDia: 13, produto: 'Croche',                  valor: 13  },
  { rowIdx: 26, colDia: 13, produto: 'Saxofone',                valor: 32  },
  { rowIdx: 27, colDia: 10, produto: 'Ebook bibílico (Infant)', valor: 4   },
  { rowIdx: 28, colDia: 9,  produto: 'Ficha de Treino',         valor: 23  },
  { rowIdx: 29, colDia: 9,  produto: '1.200 Moldes de Papel',   valor: 56  },
  { rowIdx: 30, colDia: 9,  produto: 'Exerc. Anatomia',         valor: 31  },
  { rowIdx: 31, colDia: 7,  produto: '100 Brincadeiras Bebês',  valor: 49  },
  { rowIdx: 32, colDia: 7,  produto: 'Moldes em FOAM (Dol)',    valor: 20  },
  { rowIdx: 33, colDia: 7,  produto: 'Organização do Lar',      valor: 63  },
  { rowIdx: 34, colDia: 7,  produto: 'DryWall',                 valor: 180 },
  { rowIdx: 35, colDia: 7,  produto: 'Tarot',                   valor: 69  },
  { rowIdx: 36, colDia: 7,  produto: 'Como plantar',            valor: 4   },
  { rowIdx: 37, colDia: 7,  produto: 'Neuropro',                valor: 98  },
  { rowIdx: 38, colDia: 7,  produto: '120 dinamicas infan',     valor: 9   },
  { rowIdx: 39, colDia: 7,  produto: 'Moldes EVA',              valor: 11  },
];

// RADAR DE OFERTAS — rowIdx (0-based), colDia (0-based)
const radarUpdates = [
  { rowIdx: 22, colDia: 14, produto: 'Próxy Enzimático',        valor: 7   },
  { rowIdx: 23, colDia: 14, produto: 'Médoto P.E.I',            valor: 0   },
  { rowIdx: 24, colDia: 14, produto: 'Aprovação Concursos',     valor: 110 },
  { rowIdx: 25, colDia: 14, produto: 'Album Casamento',         valor: 10  },
  { rowIdx: 26, colDia: 14, produto: 'Pacotes de músicas',      valor: 22  },
  { rowIdx: 27, colDia: 14, produto: '200 dinamicas cristã',    valor: 11  },
  { rowIdx: 28, colDia: 14, produto: 'Venda Físíca (cristã)',   valor: 96  },
  { rowIdx: 29, colDia: 14, produto: 'Bonecos bíblicos',        valor: 31  },
  { rowIdx: 30, colDia: 14, produto: 'Eternizando memórias',    valor: 0   },
  { rowIdx: 31, colDia: 14, produto: 'Croche',                  valor: 13  },
  { rowIdx: 32, colDia: 11, produto: 'Calistenia kids',         valor: 3   },
  { rowIdx: 33, colDia: 11, produto: 'Ebook bibílico (Infant)', valor: 4   },
  { rowIdx: 34, colDia: 8,  produto: 'Calcinhas (DROP)',        valor: 180 },
];

function colToLetter(col) {
  let letter = '';
  col += 1;
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

async function getAuthClient() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
  const { client_id, client_secret } = keys.installed || keys.web;
  const { refresh_token } = credentials;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  oauth2Client.setCredentials({ refresh_token });
  return oauth2Client;
}

async function batchWrite(auth, spreadsheetId, updates, label) {
  const sheets = google.sheets({ version: 'v4', auth });
  const data = updates.map(u => {
    const col = colToLetter(u.colDia);
    const row = u.rowIdx + 1;
    return { range: `${col}${row}`, values: [[u.valor]] };
  });

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data },
  });

  console.log(`✅ ${label}: ${res.data.totalUpdatedCells} células gravadas.`);
}

(async () => {
  try {
    const auth = await getAuthClient();
    await batchWrite(auth, SHEET_ACOMP, acompUpdates, 'Acompanhamento Ofertas');
    await batchWrite(auth, SHEET_RADAR, radarUpdates, 'Radar de Ofertas');
    console.log('✅ Conferência de hoje concluída!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
