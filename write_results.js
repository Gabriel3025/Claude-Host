const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// ACOMPANHAMENTO OFERTAS — rowIdx (0-based), colDia (0-based)
const acompUpdates = [
  { rowIdx: 40, colDia: 13, produto: 'Airfryer',                 valor: 43 },
  { rowIdx: 41, colDia: 13, produto: 'Saude (Euro)',             valor: 92 },
  { rowIdx: 43, colDia: 11, produto: '100 Cards Anti-Bullying',  valor: 55 },
  { rowIdx: 44, colDia: 11, produto: 'Planilha Capivarinha',     valor: 21 },
  { rowIdx: 45, colDia: 11, produto: 'JiuJistsu (LATAM)',        valor: 11 },
  { rowIdx: 46, colDia: 7,  produto: 'Kit Casinhas de Boneca',   valor: 19 },
  { rowIdx: 47, colDia: 7,  produto: 'Kit Figurinhas Educativas',valor: 74 },
];

// RADAR DE OFERTAS — rowIdx (0-based), colDia (0-based)
const radarUpdates = [];

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
