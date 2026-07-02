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

    // Obter informações da planilha
    console.log('Obtendo informações da planilha...\n');
    const result = await sheets.spreadsheets.get({ spreadsheetId });

    console.log('Abas disponíveis:');
    result.data.sheets.forEach(sheet => {
      console.log(`  - "${sheet.properties.title}"`);
    });

  } catch (e) {
    console.error('Erro:', e.message);
  }
}

main();
