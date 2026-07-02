const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');

const OAUTH_KEYS_PATH = path.join(process.env.USERPROFILE, 'Downloads', 'gcp-oauth.keys.json');
const CREDENTIALS_PATH = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const resultados = [
  { rowIdx: 1, valor: 68 },
  { rowIdx: 8, valor: 5 },
  { rowIdx: 12, valor: 59 },
  { rowIdx: 20, valor: 53 },
  { rowIdx: 30, valor: 72 },
  { rowIdx: 32, valor: 0 },
  { rowIdx: 33, valor: 19 },
  { rowIdx: 34, valor: 17 },
  { rowIdx: 35, valor: 0 },
  { rowIdx: 36, valor: 0 },
  { rowIdx: 39, valor: 6 },
  { rowIdx: 40, valor: 110 },
  { rowIdx: 41, valor: 0 },
  { rowIdx: 42, valor: 6 },
  { rowIdx: 43, valor: 21 },
  { rowIdx: 44, valor: 20 },
  { rowIdx: 52, valor: 11 },
  { rowIdx: 53, valor: 97 },
  { rowIdx: 56, valor: 16 },
  { rowIdx: 58, valor: 3 },
  { rowIdx: 60, valor: 23 },
  { rowIdx: 61, valor: 11 },
  { rowIdx: 62, valor: 0 },
  { rowIdx: 63, valor: 23 },
  { rowIdx: 64, valor: 97 },
  { rowIdx: 65, valor: 9 },
  { rowIdx: 66, valor: 7 },
  { rowIdx: 67, valor: 63 },
  { rowIdx: 68, valor: 9 },
  { rowIdx: 69, valor: 50 },
  { rowIdx: 70, valor: 22 },
  { rowIdx: 71, valor: 15 },
  { rowIdx: 72, valor: 15 },
  { rowIdx: 73, valor: 37 }
];

function log(msg) {
  console.log(msg);
}

async function main() {
  try {
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

    log('\nGravando 34 produtos em DIA 3 (coluna I)...\n');

    const updateData = [];
    for (const item of resultados) {
      const sheetRow = item.rowIdx + 1;
      updateData.push({
        range: `I${sheetRow}`,
        majorDimension: 'ROWS',
        values: [[item.valor]]
      });
    }

    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: updateData,
        valueInputOption: 'RAW'
      }
    });

    const updated = response.data.totalUpdatedCells || updateData.length;
    log(`✅ ${updated} células gravadas com sucesso!\n`);
    log(`📊 ${updateData.length} produtos processados`);
    log(`📈 Total: ${resultados.reduce((a, b) => a + b.valor, 0)} anúncios\n`);

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

main();
