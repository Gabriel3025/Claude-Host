const { google } = require(
  'C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js'
);
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = [
  { rowIdx: 45, colDia: 15, valor: 16 },
  { rowIdx: 46, colDia: 15, valor: 100 },
  { rowIdx: 47, colDia: 13, valor: 140 },
  { rowIdx: 48, colDia: 11, valor: 11 },
  { rowIdx: 49, colDia: 11, valor: 0 },
  { rowIdx: 50, colDia: 11, valor: 35 },
  { rowIdx: 51, colDia: 11, valor: 140 },
  { rowIdx: 52, colDia: 11, valor: 15 },
  { rowIdx: 53, colDia: 11, valor: 58 },
  { rowIdx: 54, colDia: 11, valor: 19 },
  { rowIdx: 55, colDia: 11, valor: 5 },
  { rowIdx: 56, colDia: 8, valor: 29 },
  { rowIdx: 57, colDia: 8, valor: 35 },
  { rowIdx: 58, colDia: 8, valor: 4 },
  { rowIdx: 59, colDia: 7, valor: 13 },
];

function colToLetter(col) {
  let letter = '';
  let n = col + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

async function main() {
  const raw = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
  const creds = JSON.parse(raw);
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);
  const sheets = google.sheets({ version: 'v4', auth });

  const data = results.map(({ rowIdx, colDia, valor }) => {
    const colLetter = colToLetter(colDia);
    const range = `${colLetter}${rowIdx}`;
    return { range, values: [[valor]] };
  });

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'RAW', data },
  });

  console.log(`✅ ${res.data.totalUpdatedCells} células atualizadas.`);
  results.forEach(({ rowIdx, colDia, valor }) => {
    console.log(`  ${colToLetter(colDia)}${rowIdx} = ${valor}`);
  });
}

main().catch(err => { console.error('Erro:', err.message); process.exit(1); });
