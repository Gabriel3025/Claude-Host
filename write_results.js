const { google } = require(
  'C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js'
);
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = [
  { rowIdx: 47, colDia: 14, valor: 140 }, // Fichas e Resumos de Letras - DIA 9
  { rowIdx: 48, colDia: 12, valor: 8 },   // Projeto Marcenaria - DIA 7
  { rowIdx: 49, colDia: 12, valor: 0 },   // Bijuteria - DIA 7
  { rowIdx: 50, colDia: 12, valor: 21 },  // Alfabetização - DIA 7
  { rowIdx: 51, colDia: 12, valor: 140 }, // Creme AntRugas (DROP) - DIA 7
  { rowIdx: 52, colDia: 12, valor: 22 },  // Atividades Copa do mundo - DIA 7
  { rowIdx: 53, colDia: 12, valor: 63 },  // Calistenia asiática - DIA 7
  { rowIdx: 54, colDia: 12, valor: 10 },  // Religião LATAM - DIA 7
  { rowIdx: 55, colDia: 12, valor: 4 },   // Dinamicas terapeuticas - DIA 7
  { rowIdx: 56, colDia: 9,  valor: 26 },  // Hora da Leiturinha - DIA 4
  { rowIdx: 57, colDia: 9,  valor: 27 },  // EUAMOAnatomia - DIA 4
  { rowIdx: 58, colDia: 9,  valor: 4 },   // Cafajeste (Acompanhar OF) - DIA 4
  { rowIdx: 59, colDia: 8,  valor: 10 },  // Sono bebe - DIA 3
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
