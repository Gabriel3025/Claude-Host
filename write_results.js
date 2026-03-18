const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMPANHAMENTO_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// rowIdx = 0-based index in grid (row 0 = headers)
// Sheet row = rowIdx + 1 (1-indexed)
// colDia = 0-based column → letter: A=0, B=1, ... J=9, K=10
function colLetter(n) {
  return String.fromCharCode(65 + n);
}

function range(rowIdx, colDia) {
  return `${colLetter(colDia)}${rowIdx + 1}`;
}

// Results collected from Facebook Ads Library 18/03/2026
// Link key → count
const counts = {
  // page_id links
  'atividade_cursiva': 38,
  'receitas_airfrayer': 36,
  // keyword links
  'doramatvflix': 26,
  'receitasmarifryer': 3,
  'geografia_biblica_es': 10,
  'dinamicaspraticas': 0,
  'futsal': 11,
  'jiujitsu': 37,
  'omapadabibliabr': 27,
  'biblical_geography': 18,
  'gelatina': 54,
  'calistenia': 6,
  'gpt_nutri': 21,
  'modelos_story': 14,
  'saxofone': 88,
  'marmita_fit': 30,
  'alfabetizacao': 22,
  'recheios': 19,
  'exercicios_black': 45,
  'versiculos': 18,
  'caligrafia': 16,
};

// Acompanhamento: rowIdx (0-based in grid), colDia (0-based), value
const acompanhamento_updates = [
  { rowIdx: 1, colDia: 9,  value: counts['atividade_cursiva'] },  // DIA5 J2
  { rowIdx: 2, colDia: 9,  value: counts['receitas_airfrayer'] }, // DIA5 J3
  { rowIdx: 3, colDia: 7,  value: counts['doramatvflix'] },       // DIA3 H4
  { rowIdx: 4, colDia: 7,  value: counts['receitasmarifryer'] },  // DIA3 H5
  { rowIdx: 5, colDia: 7,  value: counts['geografia_biblica_es'] }, // DIA3 H6
  { rowIdx: 6, colDia: 7,  value: counts['dinamicaspraticas'] },  // DIA3 H7
  { rowIdx: 7, colDia: 7,  value: counts['futsal'] },             // DIA3 H8
  { rowIdx: 8, colDia: 7,  value: counts['jiujitsu'] },           // DIA3 H9
  { rowIdx: 9, colDia: 7,  value: counts['biblical_geography'] }, // DIA3 H10
  { rowIdx: 10, colDia: 7, value: counts['gelatina'] },           // DIA3 H11
  { rowIdx: 11, colDia: 7, value: counts['marmita_fit'] },        // DIA3 H12
  { rowIdx: 12, colDia: 7, value: counts['alfabetizacao'] },      // DIA3 H13
  { rowIdx: 13, colDia: 7, value: counts['recheios'] },           // DIA3 H14
  { rowIdx: 14, colDia: 7, value: counts['exercicios_black'] },   // DIA3 H15
  { rowIdx: 15, colDia: 7, value: counts['versiculos'] },         // DIA3 H16
];

// Radar: rowIdx (0-based in grid), colDia (0-based), value
const radar_updates = [
  { rowIdx: 1,  colDia: 10, value: counts['atividade_cursiva'] },    // DIA5 K2
  { rowIdx: 2,  colDia: 10, value: counts['receitas_airfrayer'] },   // DIA5 K3
  { rowIdx: 3,  colDia: 8,  value: counts['doramatvflix'] },         // DIA3 I4
  { rowIdx: 4,  colDia: 8,  value: counts['receitasmarifryer'] },    // DIA3 I5
  { rowIdx: 5,  colDia: 8,  value: counts['geografia_biblica_es'] }, // DIA3 I6
  { rowIdx: 6,  colDia: 8,  value: counts['dinamicaspraticas'] },    // DIA3 I7
  { rowIdx: 7,  colDia: 8,  value: counts['futsal'] },               // DIA3 I8
  { rowIdx: 8,  colDia: 8,  value: counts['jiujitsu'] },             // DIA3 I9
  { rowIdx: 9,  colDia: 8,  value: counts['omapadabibliabr'] },      // DIA3 I10
  { rowIdx: 10, colDia: 8,  value: counts['biblical_geography'] },   // DIA3 I11
  { rowIdx: 11, colDia: 8,  value: counts['gelatina'] },             // DIA3 I12
  { rowIdx: 12, colDia: 8,  value: counts['calistenia'] },           // DIA3 I13
  { rowIdx: 13, colDia: 8,  value: counts['gpt_nutri'] },            // DIA3 I14
  { rowIdx: 14, colDia: 8,  value: counts['modelos_story'] },        // DIA3 I15
  { rowIdx: 15, colDia: 8,  value: counts['saxofone'] },             // DIA3 I16
  { rowIdx: 16, colDia: 8,  value: counts['marmita_fit'] },          // DIA3 I17
  { rowIdx: 17, colDia: 8,  value: counts['alfabetizacao'] },        // DIA3 I18
  { rowIdx: 18, colDia: 8,  value: counts['recheios'] },             // DIA3 I19
  { rowIdx: 19, colDia: 8,  value: counts['exercicios_black'] },     // DIA3 I20
  { rowIdx: 20, colDia: 8,  value: counts['versiculos'] },           // DIA3 I21
  { rowIdx: 21, colDia: 8,  value: counts['caligrafia'] },           // DIA3 I22
];

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

  // Write Acompanhamento
  console.log('Escrevendo Acompanhamento Ofertas...');
  const acompData = acompanhamento_updates.map(u => ({
    range: range(u.rowIdx, u.colDia),
    values: [[String(u.value)]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: ACOMPANHAMENTO_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: acompData,
    },
  });
  console.log(`✅ Acompanhamento: ${acompData.length} células escritas`);

  // Write Radar
  console.log('Escrevendo Radar de Ofertas...');
  const radarData = radar_updates.map(u => ({
    range: range(u.rowIdx, u.colDia),
    values: [[String(u.value)]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: RADAR_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: radarData,
    },
  });
  console.log(`✅ Radar: ${radarData.length} células escritas`);

  console.log('\n✅ Conferência de Ofertas 18/03/2026 concluída!');
}

main().catch(console.error);
