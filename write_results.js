const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cellAddr(c, r) { return colLetter(c) + (r + 1); }

async function writeResults() {
  const resultados = JSON.parse(fs.readFileSync('resultados_hoje.json'));

  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
  const oauthKeys = keys.installed || keys.web;
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
  auth.setCredentials({ access_token: creds.access_token, refresh_token: creds.refresh_token });
  const sheets = google.sheets({ version: 'v4', auth });

  const bySheet = {};

  for (const r of resultados) {
    const sheetId = r.sheet;
    const cellAddress = cellAddr(r.colDia, r.rowIdx);

    if (!bySheet[sheetId]) {
      bySheet[sheetId] = [];
    }

    bySheet[sheetId].push({
      range: cellAddress,
      values: [[r.valor !== null ? r.valor : 0]]
    });
  }

  console.log('\n💾 Gravando nas planilhas...\n');

  for (const [sheetId, data] of Object.entries(bySheet)) {
    const label = sheetId === SHEET_ACOMP ? 'Acompanhamento Ofertas' : 'Radar de Ofertas';

    try {
      await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          valueInputOption: 'RAW',
          data: data
        }
      });
      console.log(`✅ ${label}: ${data.length} células gravadas`);
    } catch (err) {
      console.error(`❌ Erro ao gravar ${label}:`, err.message);
    }
  }

  console.log('\n✅ CONFERÊNCIA CONCLUÍDA!\n');
}

writeResults().catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
