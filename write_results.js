const { google } = require(
  'C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js'
);
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = [
  { rowIdx: 60, colDia: 15, valor: 0 },   // Sono bebe - DIA 10
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
