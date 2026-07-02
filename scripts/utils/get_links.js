const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');
const path = require('path');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

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

  const response = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    includeGridData: true,
    ranges: ['A:H'],
  });

  const grid = response.data.sheets[0].data[0].rowData;

  // Mostra cabeçalhos e todos os hyperlinks por coluna
  const headers = grid[0]?.values?.map(c => c.formattedValue || '') || [];
  console.log('Colunas:', headers.map((h, i) => `[${i}] ${h}`).join(', '));
  console.log('---');

  for (const row of grid.slice(1)) {
    if (!row.values) continue;
    const produto = row.values[0]?.formattedValue || '';
    if (!produto) continue;
    row.values.forEach((cell, i) => {
      if (cell.hyperlink) {
        console.log(`${produto} | col[${i}] (${headers[i]}): ${cell.hyperlink}`);
      }
    });
  }
}

main().catch(console.error);
