const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// rowIdx = linha no grid (0=header, 1=primeira linha de dados)
// colDia = índice de coluna (0-based)
// valor = número coletado
const updates = [
  { rowIdx: 1,  colDia: 8, valor: 38 },  // Atividade cursiva - DIA 4
  { rowIdx: 2,  colDia: 8, valor: 36 },  // Receitas airfrayer - DIA 4
  { rowIdx: 3,  colDia: 6, valor: 46 },  // DoramaFlix - DIA 2
  { rowIdx: 4,  colDia: 6, valor: 4  },  // Receitas rápidas - DIA 2
  { rowIdx: 5,  colDia: 6, valor: 10 },  // Cristão (es) - DIA 2
  { rowIdx: 6,  colDia: 6, valor: 13 },  // Aprender Kids - DIA 2
  { rowIdx: 7,  colDia: 6, valor: 12 },  // Treino Futsal - DIA 2
  { rowIdx: 8,  colDia: 6, valor: 37 },  // Jiujistu - DIA 2
  { rowIdx: 9,  colDia: 6, valor: 18 },  // Cristão (en) - DIA 2
  { rowIdx: 10, colDia: 6, valor: 54 },  // Protocolo gelatina - DIA 2
  { rowIdx: 11, colDia: 6, valor: 30 },  // Receitas Marmita Fit - DIA 2
  { rowIdx: 12, colDia: 6, valor: 22 },  // Alfabetização - DIA 2
  { rowIdx: 13, colDia: 6, valor: 19 },  // Recheios - DIA 2
  { rowIdx: 14, colDia: 6, valor: 45 },  // Exercicios (Black) - DIA 2
  { rowIdx: 15, colDia: 6, valor: 0  },  // 365 Versículos - DIA 2
];

function colToLetter(col) {
  let letter = '';
  col += 1; // 1-based
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );
  auth.setCredentials(savedCredentials);

  const sheets = google.sheets({ version: 'v4', auth });

  const data = updates.map(({ rowIdx, colDia, valor }) => {
    const sheetRow = rowIdx + 1; // header é row 1, dados começam row 2
    const colLetter = colToLetter(colDia);
    const range = `${colLetter}${sheetRow}`;
    return { range, values: [[valor]] };
  });

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data,
    },
  });

  console.log(`✅ ${response.data.totalUpdatedCells} células atualizadas com sucesso!`);
  updates.forEach(({ rowIdx, colDia, valor }) => {
    const colLetter = colToLetter(colDia);
    console.log(`  ${colLetter}${rowIdx + 1} = ${valor}`);
  });
}

main().catch(console.error);
