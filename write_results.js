const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// ACOMPANHAMENTO OFERTAS — rowIdx (0-based), colDia (0-based)
const acompUpdates = [
  { rowIdx: 3,  colDia: 15, produto: 'DoramaFlix',              valor: 52  },
  { rowIdx: 4,  colDia: 15, produto: 'Receitas rápidas',         valor: 3   },
  { rowIdx: 5,  colDia: 15, produto: 'Cristão (geografia)',       valor: 10  },
  { rowIdx: 6,  colDia: 15, produto: 'Aprender Kids',            valor: 8   },
  { rowIdx: 7,  colDia: 15, produto: 'Treino Futsal',            valor: 11  },
  { rowIdx: 8,  colDia: 15, produto: 'Jiujistu',                 valor: 50  },
  { rowIdx: 9,  colDia: 15, produto: 'Cristão (biblical)',        valor: 18  },
  { rowIdx: 10, colDia: 15, produto: 'Protocolo gelatina',       valor: 0   },
  { rowIdx: 11, colDia: 15, produto: 'Receitas (Marmita Fit)',   valor: 36  },
  { rowIdx: 12, colDia: 15, produto: 'Alfabetização',            valor: 22  },
  { rowIdx: 13, colDia: 15, produto: 'Recheios',                 valor: 19  },
  { rowIdx: 14, colDia: 15, produto: 'Exercicios (Black)',       valor: 50  },
  { rowIdx: 15, colDia: 15, produto: '365 Versículos bíblia',    valor: 18  },
  { rowIdx: 16, colDia: 12, produto: 'Próxy Enzimático',         valor: 6   },
  { rowIdx: 17, colDia: 12, produto: 'Médoto P.E.I',             valor: 4   },
  { rowIdx: 18, colDia: 12, produto: 'Aprovação Concursos',      valor: 100 },
  { rowIdx: 19, colDia: 12, produto: 'Album Casamento',          valor: 10  },
  { rowIdx: 20, colDia: 12, produto: 'Pacotes de músicas',       valor: 19  },
  { rowIdx: 21, colDia: 12, produto: '200 Dinâmicas Cristã',     valor: 15  },
  { rowIdx: 22, colDia: 12, produto: 'Venda Física (cristã)',    valor: 78  },
  { rowIdx: 23, colDia: 12, produto: 'Bonecos bíblicos',         valor: 15  },
  { rowIdx: 24, colDia: 12, produto: 'Eternizando memórias',     valor: 0   },
  { rowIdx: 25, colDia: 12, produto: 'Croche',                   valor: 9   },
  { rowIdx: 26, colDia: 12, produto: 'Saxofone',                 valor: 43  },
  { rowIdx: 27, colDia: 9,  produto: 'Ebook bíblico (Infant)',   valor: 4   },
  { rowIdx: 28, colDia: 8,  produto: 'Ficha de Treino',          valor: 23  },
  { rowIdx: 29, colDia: 8,  produto: '1.200 Moldes de Papel',    valor: 50  },
  { rowIdx: 30, colDia: 8,  produto: 'Exerc. Anatomia',          valor: 49  },
];

// RADAR DE OFERTAS — rowIdx (0-based), colDia (0-based)
const radarUpdates = [
  { rowIdx: 3,  colDia: 16, produto: 'DoramaFlix',              valor: 52  },
  { rowIdx: 4,  colDia: 16, produto: 'Receitas rápidas',         valor: 3   },
  { rowIdx: 5,  colDia: 16, produto: 'Cristão (geografia)',       valor: 10  },
  { rowIdx: 6,  colDia: 16, produto: 'Aprender Kids',            valor: 8   },
  { rowIdx: 7,  colDia: 16, produto: 'Treino Futsal',            valor: 11  },
  { rowIdx: 8,  colDia: 16, produto: 'Jiujistu',                 valor: 50  },
  { rowIdx: 9,  colDia: 16, produto: 'Cristão (omapadabibliabr)',valor: 14  },
  { rowIdx: 10, colDia: 16, produto: 'Cristão (biblical)',        valor: 18  },
  { rowIdx: 11, colDia: 16, produto: 'Protocolo gelatina',       valor: 0   },
  { rowIdx: 12, colDia: 16, produto: 'Calistenia',               valor: 7   },
  { rowIdx: 13, colDia: 16, produto: 'GPT para nutricionistas',  valor: 20  },
  { rowIdx: 14, colDia: 16, produto: 'Modelos de Story',         valor: 14  },
  { rowIdx: 15, colDia: 16, produto: 'Saxofone',                 valor: 43  },
  { rowIdx: 16, colDia: 16, produto: 'Receitas (Marmita Fit)',   valor: 36  },
  { rowIdx: 17, colDia: 16, produto: 'Alfabetização',            valor: 22  },
  { rowIdx: 18, colDia: 16, produto: 'Recheios',                 valor: 19  },
  { rowIdx: 19, colDia: 16, produto: 'Exercicios (Black)',       valor: 50  },
  { rowIdx: 20, colDia: 16, produto: '365 Versículos bíblia',    valor: 18  },
  { rowIdx: 21, colDia: 16, produto: 'Caligrafia',               valor: 16  },
  { rowIdx: 22, colDia: 13, produto: 'Próxy Enzimático',         valor: 6   },
  { rowIdx: 23, colDia: 13, produto: 'Médoto P.E.I',             valor: 4   },
  { rowIdx: 24, colDia: 13, produto: 'Aprovação Concursos',      valor: 100 },
  { rowIdx: 25, colDia: 13, produto: 'Album Casamento',          valor: 10  },
  { rowIdx: 26, colDia: 13, produto: 'Pacotes de músicas',       valor: 19  },
  { rowIdx: 27, colDia: 13, produto: '200 Dinâmicas Cristã',     valor: 15  },
  { rowIdx: 28, colDia: 13, produto: 'Venda Física (cristã)',    valor: 78  },
  { rowIdx: 29, colDia: 13, produto: 'Bonecos bíblicos',         valor: 15  },
  { rowIdx: 30, colDia: 13, produto: 'Eternizando memórias',     valor: 0   },
  { rowIdx: 31, colDia: 13, produto: 'Croche',                   valor: 9   },
  { rowIdx: 32, colDia: 10, produto: 'Calistenia kids',          valor: 3   },
  { rowIdx: 33, colDia: 10, produto: 'Ebook bíblico (Infant)',   valor: 4   },
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
