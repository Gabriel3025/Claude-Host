const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function getColunaDIA(dia) {
  const colMap = { 1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K', 6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P' };
  return colMap[dia];
}

async function main() {
  try {
    const results = JSON.parse(fs.readFileSync('results_dia9.json', 'utf8'));
    console.log(`📊 Gravando ${results.length} produtos (DIA 9)...\n`);

    const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
    const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const clientKeys = oauthKeys.installed || oauthKeys.web;

    const auth = new google.auth.OAuth2(clientKeys.client_id, clientKeys.client_secret, clientKeys.redirect_uris[0]);
    auth.setCredentials(savedCredentials);

    const sheets = google.sheets({ version: 'v4', auth });

    const data = results.map(r => ({
      range: `${getColunaDIA(9)}${r.rowIdx + 1}`,
      values: [[r.valor]]
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { data, valueInputOption: 'RAW' }
    });

    console.log('✅ Gravação concluída!\n');
    console.log('📋 Resumo:');

    let count = 0;
    results.forEach(r => {
      if (count < 5) console.log(`  [O${r.rowIdx + 1}] ${r.produto}: ${r.valor}`);
      count++;
    });

    if (results.length > 5) {
      console.log(`  ... e mais ${results.length - 5}`);
    }

    const total = results.reduce((sum, r) => sum + r.valor, 0);
    console.log(`\n✅ Total: ${results.length} células | ${total} anúncios`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
