const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ID_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const ID_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

function colLetter(n) { return String.fromCharCode(65 + n); }
function cellRef(rowIdx, colDia) { return `${colLetter(colDia)}${rowIdx + 1}`; }

async function writeSheet(sheets, spreadsheetId, updates) {
  const data = updates.map(u => ({
    range: cellRef(u.rowIdx, u.colDia),
    values: [[u.value]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data },
  });
}

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;
  const auth = new google.auth.OAuth2(clientKeys.client_id, clientKeys.client_secret, clientKeys.redirect_uris[0]);
  auth.setCredentials(creds);
  const sheets = google.sheets({ version: 'v4', auth });

  // ACOMPANHAMENTO OFERTAS
  const acompUpdates = [
    { rowIdx: 1,  colDia: 12, value: 38  }, // Atividade cursiva - DIA7
    { rowIdx: 2,  colDia: 12, value: 33  }, // Receitas airfrayer - DIA7
    { rowIdx: 3,  colDia: 10, value: 47  }, // DoramaFlix - DIA5
    { rowIdx: 4,  colDia: 10, value: 3   }, // Receitas rápidas - DIA5
    { rowIdx: 5,  colDia: 10, value: 10  }, // Cristão (geografia-biblica-es) - DIA5
    { rowIdx: 6,  colDia: 10, value: 9   }, // Aprender Kids - DIA5
    { rowIdx: 7,  colDia: 10, value: 11  }, // Treino Futsal - DIA5
    { rowIdx: 8,  colDia: 10, value: 42  }, // Jiujistu - DIA5
    { rowIdx: 9,  colDia: 10, value: 18  }, // Cristão (biblical-geography) - DIA5
    { rowIdx: 10, colDia: 10, value: 51  }, // Protocolo gelatina - DIA5
    { rowIdx: 11, colDia: 10, value: 36  }, // Receitas (Marmita Fit) - DIA5
    { rowIdx: 12, colDia: 10, value: 22  }, // Alfabetização - DIA5
    { rowIdx: 13, colDia: 10, value: 19  }, // Recheios - DIA5
    { rowIdx: 14, colDia: 10, value: 28  }, // Exercicios (Black) - DIA5
    { rowIdx: 15, colDia: 10, value: 18  }, // 365 Versículos bíblia - DIA5
    { rowIdx: 16, colDia: 7,  value: 6   }, // Próxy Enzimático - DIA2
    { rowIdx: 17, colDia: 7,  value: 40  }, // Médoto P.E.I - DIA2
    { rowIdx: 18, colDia: 7,  value: 110 }, // Aprovação Concursos - DIA2
    { rowIdx: 19, colDia: 7,  value: 16  }, // Album Casamento - DIA2
    { rowIdx: 20, colDia: 7,  value: 19  }, // Pacotes de músicas - DIA2
    { rowIdx: 21, colDia: 7,  value: 17  }, // 200 dinamicas cristã - DIA2
    { rowIdx: 22, colDia: 7,  value: 130 }, // Venda Física (cristã) - DIA2
    { rowIdx: 23, colDia: 7,  value: 15  }, // Bonecos bíblicos - DIA2
    { rowIdx: 24, colDia: 7,  value: 32  }, // Eternizando memórias - DIA2
    { rowIdx: 25, colDia: 7,  value: 17  }, // Croche - DIA2
    { rowIdx: 26, colDia: 7,  value: 42  }, // Saxofone - DIA2
  ];

  // RADAR DE OFERTAS
  const radarUpdates = [
    { rowIdx: 1,  colDia: 13, value: 38  }, // Atividade cursiva - DIA7
    { rowIdx: 2,  colDia: 13, value: 33  }, // Receitas airfrayer - DIA7
    { rowIdx: 3,  colDia: 11, value: 47  }, // DoramaFlix - DIA5
    { rowIdx: 4,  colDia: 11, value: 3   }, // Receitas rápidas - DIA5
    { rowIdx: 5,  colDia: 11, value: 10  }, // Cristão (geografia-biblica-es) - DIA5
    { rowIdx: 6,  colDia: 11, value: 9   }, // Aprender Kids - DIA5
    { rowIdx: 7,  colDia: 11, value: 11  }, // Treino Futsal - DIA5
    { rowIdx: 8,  colDia: 11, value: 42  }, // Jiujistu - DIA5
    { rowIdx: 9,  colDia: 11, value: 10  }, // Cristão (omapadabibliabr) - DIA5
    { rowIdx: 10, colDia: 11, value: 18  }, // Cristão (biblical-geography) - DIA5
    { rowIdx: 11, colDia: 11, value: 51  }, // Protocolo gelatina - DIA5
    { rowIdx: 12, colDia: 11, value: 4   }, // Calistenia - DIA5
    { rowIdx: 13, colDia: 11, value: 26  }, // GPT para nutricionistas - DIA5
    { rowIdx: 14, colDia: 11, value: 15  }, // Modelos de Story - DIA5
    { rowIdx: 15, colDia: 11, value: 42  }, // Saxofone - DIA5
    { rowIdx: 16, colDia: 11, value: 36  }, // Receitas (Marmita Fit) - DIA5
    { rowIdx: 17, colDia: 11, value: 22  }, // Alfabetização - DIA5
    { rowIdx: 18, colDia: 11, value: 19  }, // Recheios - DIA5
    { rowIdx: 19, colDia: 11, value: 28  }, // Exercicios (Black) - DIA5
    { rowIdx: 20, colDia: 11, value: 18  }, // 365 Versículos bíblia - DIA5
    { rowIdx: 21, colDia: 11, value: 17  }, // Caligrafia - DIA5
    { rowIdx: 22, colDia: 8,  value: 6   }, // Próxy Enzimático - DIA2
    { rowIdx: 23, colDia: 8,  value: 40  }, // Médoto P.E.I - DIA2
    { rowIdx: 24, colDia: 8,  value: 110 }, // Aprovação Concursos - DIA2
    { rowIdx: 25, colDia: 8,  value: 16  }, // Album Casamento - DIA2
    { rowIdx: 26, colDia: 8,  value: 19  }, // Pacotes de músicas - DIA2
    { rowIdx: 27, colDia: 8,  value: 17  }, // 200 dinamicas cristã - DIA2
    { rowIdx: 28, colDia: 8,  value: 130 }, // Venda Física (cristã) - DIA2
    { rowIdx: 29, colDia: 8,  value: 15  }, // Bonecos bíblicos - DIA2
    { rowIdx: 30, colDia: 8,  value: 32  }, // Eternizando memórias - DIA2
    { rowIdx: 31, colDia: 8,  value: 17  }, // Croche - DIA2
  ];

  console.log('Gravando Acompanhamento Ofertas...');
  await writeSheet(sheets, ID_ACOMP, acompUpdates);
  console.log(`✅ ${acompUpdates.length} células gravadas.`);

  console.log('Gravando Radar de Ofertas...');
  await writeSheet(sheets, ID_RADAR, radarUpdates);
  console.log(`✅ ${radarUpdates.length} células gravadas.`);

  console.log('\n✅ Conferência concluída!');
}

main().catch(console.error);
