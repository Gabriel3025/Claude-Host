const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function parseDate(str) {
  // Format: DD/MM/YYYY
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(d1, d2) {
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

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
    ranges: ['A:Z'],
  });

  const grid = response.data.sheets[0].data[0].rowData;
  const today = new Date(2026, 2, 18); // 18/03/2026

  const tasks = [];

  for (let rowIdx = 1; rowIdx < grid.length; rowIdx++) {
    const row = grid[rowIdx];
    if (!row.values) continue;

    const produto = row.values[0]?.formattedValue || '';
    if (!produto) continue;

    const identificado = row.values[1]?.formattedValue || '';
    if (!identificado) continue;

    const link = row.values[2]?.hyperlink || '';
    const diaInicio = parseDate(identificado);
    const diasPassados = daysBetween(diaInicio, today); // 0 = DIA1, 1 = DIA2, etc.
    const colDia = 5 + diasPassados; // DIA1 = col[5], DIA2 = col[6], ...
    const diaNome = `DIA ${diasPassados + 1}`;

    if (diasPassados < 0 || diasPassados >= 5) {
      // Fora da janela de 5 dias
      continue;
    }

    const valorAtual = row.values[colDia]?.formattedValue || '';

    tasks.push({
      rowIdx,        // linha no sheet (0-based, linha 1 = headers)
      colDia,        // coluna a preencher (0-based)
      produto,
      identificado,
      diasPassados,
      diaNome,
      link,
      valorAtual,
      precisaPreenchimento: valorAtual === ''
    });
  }

  console.log(JSON.stringify(tasks, null, 2));
}

main().catch(console.error);
