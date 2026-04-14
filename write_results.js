const { google } = require(
  'C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js'
);
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = [
  { rowIdx: 45, colDia: 14, produto: 'Kit Casinhas de Boneca', value: 15 },
  { rowIdx: 46, colDia: 14, produto: 'Kit Figurinhas Educativas', value: 100 },
  { rowIdx: 47, colDia: 12, produto: 'Fichas e Resumos de Letras', value: 140 },
  { rowIdx: 48, colDia: 10, produto: 'Projeto Marcenaria', value: 14 },
  { rowIdx: 49, colDia: 10, produto: 'Bijuteria', value: 0 },
  { rowIdx: 50, colDia: 10, produto: 'Alfabetização', value: 39 },
  { rowIdx: 51, colDia: 10, produto: 'Creme AntRugas (DROP)', value: 140 },
  { rowIdx: 52, colDia: 10, produto: 'Atividades Copa do mundo', value: 29 },
  { rowIdx: 53, colDia: 10, produto: 'Calistenia asiática', value: 50 },
  { rowIdx: 54, colDia: 10, produto: 'Religião LATAM', value: 19 },
  { rowIdx: 55, colDia: 10, produto: 'Dinamicas terapeuticas', value: 8 },
  { rowIdx: 56, colDia: 7,  produto: 'Hora da Leiturinha', value: 30 },
  { rowIdx: 57, colDia: 7,  produto: 'EUAMOAnatomia', value: 29 },
  { rowIdx: 58, colDia: 7,  produto: 'Cafajeste (Acompanhar OF)', value: 4 },
];

function colIdxToLetter(idx) {
  let letter = '';
  let n = idx + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

async function main() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  const sheets = google.sheets({ version: 'v4', auth });

  const data = results.map(r => {
    const col = colIdxToLetter(r.colDia);
    const row = r.rowIdx + 1;
    const range = `${col}${row}`;
    console.log(`  ${r.produto}: ${range} = ${r.value}`);
    return {
      range,
      values: [[r.value]]
    };
  });

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data
    }
  });

  console.log(`\n✅ ${res.data.totalUpdatedCells} células atualizadas com sucesso!`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
