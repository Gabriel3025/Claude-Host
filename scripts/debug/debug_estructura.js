const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function main() {
  try {
    const gcpPath = path.join(process.env.USERPROFILE, 'Downloads', 'gcp-oauth.keys.json');
    const tokenPath = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');

    const gcpContent = JSON.parse(fs.readFileSync(gcpPath, 'utf-8'));
    const tokenContent = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));

    const { client_id, client_secret, redirect_uris } = gcpContent.installed;

    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials({
      access_token: tokenContent.access_token,
      refresh_token: tokenContent.refresh_token,
      expiry_date: tokenContent.expiry_date
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

    // Ler primeiras 10 linhas
    console.log('Lendo primeiras 10 linhas da planilha:\n');
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Página1!A1:P10'
    });

    const rows = result.data.values || [];
    rows.forEach((row, idx) => {
      console.log(`\nLinha ${idx + 1}:`);
      console.log(`  [0] Produto: ${row[0]}`);
      console.log(`  [1] Identificado: ${row[1]}`);
      console.log(`  [2] Dias: ${row[2]}`);
      console.log(`  [4] Coluna: ${row[4]}`);
      console.log(`  [5] Link: ${row[5] ? row[5].substring(0, 50) + '...' : '(vazio)'}`);
      if (row.length > 12) {
        console.log(`  [12] Valor Coluna M: ${row[12] || '(vazio)'}`);
      }
    });

  } catch (e) {
    console.error('Erro:', e.message);
  }
}

main();
