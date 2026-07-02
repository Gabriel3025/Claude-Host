const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// rowIdx = índice no grid (0=header), colDia = coluna 0-based
const updates = [
  { rowIdx: 9,  colDia: 7, valor: 16 }, // Cristão (omapadabibliabr) - DIA 2
  { rowIdx: 12, colDia: 7, valor: 8  }, // Calistenia - DIA 2
  { rowIdx: 13, colDia: 7, valor: 22 }, // GPT para nutricionistas - DIA 2
  { rowIdx: 14, colDia: 7, valor: 12 }, // Modelos de Story - DIA 2
  { rowIdx: 15, colDia: 7, valor: 91 }, // Saxofone - DIA 2
  { rowIdx: 21, colDia: 7, valor: 16 }, // Caligrafia - DIA 2
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
    const sheetRow = rowIdx + 1;
    const colLetter = colToLetter(colDia);
    const range = `${colLetter}${sheetRow}`;
    return { range, values: [[valor]] };
  });

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });

  console.log(`✅ ${response.data.totalUpdatedCells} células atualizadas!`);
  updates.forEach(({ rowIdx, colDia, valor }) => {
    const colLetter = colToLetter(colDia);
    console.log(`  ${colLetter}${rowIdx + 1} = ${valor}`);
  });
}

main().catch(console.error);
