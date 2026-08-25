const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const COL_PRODUTO      = 0;
const COL_IDENTIFICADO = 1;
const COL_BIBLIOTECA   = 2;
const COL_DIA1         = 6;

function parseDate(str) {
  const [d, m, y] = str.split('/').map(Number);
  return new Date(y, m - 1, d);
}

function daysBetween(d1, d2) {
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function todayMidnight() {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
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

    // Tentar renovar token se expirado
    if (savedCredentials.expiry_date && Date.now() >= savedCredentials.expiry_date) {
      console.log('⏳ Token expirado, renovando...');
      const { credentials } = await auth.refreshAccessToken();
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(credentials, null, 2));
      auth.setCredentials(credentials);
      console.log('✅ Token renovado com sucesso\n');
    }

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      includeGridData: true,
      ranges: ['A:Z'],
    });

    const grid = response.data.sheets[0].data[0].rowData;
    const today = todayMidnight();

    const tasks = [];
    const encerrados = [];

    for (let rowIdx = 1; rowIdx < grid.length; rowIdx++) {
      const row = grid[rowIdx];
      if (!row.values) continue;

      const produto = row.values[COL_PRODUTO]?.formattedValue || '';
      if (!produto) continue;

      const identificado = row.values[COL_IDENTIFICADO]?.formattedValue || '';
      if (!identificado) continue;

      const link = row.values[COL_BIBLIOTECA]?.hyperlink || '';
      const diaInicio = parseDate(identificado);
      const diasPassados = daysBetween(diaInicio, today);
      const colDia = COL_DIA1 + diasPassados;
      const diaNome = `DIA ${diasPassados + 1}`;

      if (diasPassados < 0) continue;

      if (diasPassados >= 10) {
        encerrados.push({ rowIdx, produto, identificado, diasPassados });
        continue;
      }

      const valorAtual = row.values[colDia]?.formattedValue || '';

      tasks.push({
        rowIdx,
        colDia,
        produto,
        identificado,
        diasPassados,
        diaNome,
        link,
        valorAtual,
        precisaPreenchimento: valorAtual === ''
      });
    }

    if (encerrados.length > 0) {
      console.log('\n⛔ ENCERRADOS (passaram do DIA 10 — busca não necessária):');
      encerrados.forEach(e => {
        console.log(`  [linha ${e.rowIdx + 1}] ${e.produto} | Identificado: ${e.identificado} | ${e.diasPassados} dias atrás`);
      });
    }

    console.log(JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error('Erro:', err.message);
    process.exit(1);
  }
}

main();
