const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cellAddr(c, r) { return colLetter(c) + (r + 1); }

async function writeResults() {
  const resultados = JSON.parse(fs.readFileSync('resultados_hoje.json'));

  const keys = JSON.parse(fs.readFileSync('C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json'));
  const oauthKeys = keys.installed || keys.web;
  const creds = JSON.parse(fs.readFileSync('C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json'));
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
  auth.setCredentials({ access_token: creds.access_token, refresh_token: creds.refresh_token });
  const sheets = google.sheets({ version: 'v4', auth });

  const data = resultados.map(r => ({
    range: cellAddr(r.colDia, r.rowIdx),
    values: [[r.valor !== null ? r.valor : 0]]
  }));

  console.log(`\n💾 Gravando ${data.length} células em Acompanhamento Ofertas...\n`);

  try {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ACOMP,
      requestBody: { valueInputOption: 'RAW', data }
    });
    console.log(`✅ GRAVAÇÃO CONCLUÍDA: ${data.length} células registradas!\n`);
    console.log('Primeiras 10 registros:');
    data.slice(0, 10).forEach((d, i) => {
      console.log(`  ${i+1}. ${d.range}: ${d.values[0][0]}`);
    });
  } catch (err) {
    console.error(`❌ Erro:`, err.message);
  }
}

writeResults();
