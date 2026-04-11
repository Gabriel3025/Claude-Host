const { google } = require(
  'C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js'
);
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = [
  { rowIdx: 42, colDia: 15, produto: '100 Cards Anti-Bullying', valor: 65 },
  { rowIdx: 43, colDia: 15, produto: 'Planilha Capivarinha', valor: 20 },
  { rowIdx: 44, colDia: 15, produto: 'JiuJistsu (LATAM)', valor: 12 },
  { rowIdx: 45, colDia: 11, produto: 'Kit Casinhas de Boneca', valor: 19 },
  { rowIdx: 46, colDia: 11, produto: 'Kit Figurinhas Educativas', valor: 99 },
  { rowIdx: 47, colDia: 9,  produto: 'Fichas e Resumos de Letras', valor: 110 },
  { rowIdx: 48, colDia: 7,  produto: 'Projeto Marcenaria', valor: 12 },
  { rowIdx: 49, colDia: 7,  produto: 'Bijuteria', valor: 12 },
  { rowIdx: 50, colDia: 7,  produto: 'Alfabetização', valor: 40 },
  { rowIdx: 51, colDia: 7,  produto: 'Creme AntRugas (DROP)', valor: 46 },
  { rowIdx: 52, colDia: 7,  produto: 'Atividades Copa do mundo', valor: 10 },
  { rowIdx: 53, colDia: 7,  produto: 'Calistenia asiática', valor: 26 },
  { rowIdx: 54, colDia: 7,  produto: 'Religião LATAM', valor: 15 },
  { rowIdx: 55, colDia: 7,  produto: 'Dinamicas terapeuticas', valor: 9 },
];

function colToLetter(col) {
  let letter = '';
  col = col + 1;
  while (col > 0) {
    const rem = (col - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    col = Math.floor((col - 1) / 26);
  }
  return letter;
}

async function main() {
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  const sheets = google.sheets({ version: 'v4', auth });

  const data = results.map(r => {
    const col = colToLetter(r.colDia);
    const range = `${col}${r.rowIdx}`;
    return { range, values: [[r.valor]] };
  });

  const res = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data,
    },
  });

  console.log(`✅ ${res.data.totalUpdatedCells} células atualizadas.`);
  results.forEach(r => {
    const col = colToLetter(r.colDia);
    console.log(`  [linha ${r.rowIdx}] ${r.produto} → ${col}${r.rowIdx} = ${r.valor}`);
  });
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
