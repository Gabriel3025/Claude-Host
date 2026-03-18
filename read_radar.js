const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Colunas — Radar de Ofertas
// [0] (vazio) | [1] PRODUTO | [2] IDENTIFICADO | [3] BIBLIOTECA (hyperlink) | [4] SITE
// [5] Ticket  | [6] STATUS  | [7] DIA 1 ... [16] DIA 10 | [17] APÓS TESTE
const COL_PRODUTO      = 1;
const COL_IDENTIFICADO = 2;
const COL_BIBLIOTECA   = 3;
const COL_DIA1         = 7; // DIA 1 = col[7], DIA 2 = col[8], ..., DIA 10 = col[16]

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
  const today = todayMidnight();

  // Mostrar cabeçalhos
  const headers = grid[0]?.values?.map(c => c.formattedValue || '') || [];
  console.log('Cabeçalhos:', headers.map((h, i) => `[${i}] ${h}`).join(', '));
  console.log('---');

  const tasks = [];

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

    if (diasPassados < 0 || diasPassados >= 10) continue;

    const valorAtual = row.values[colDia]?.formattedValue ?? '';

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

  // Mostrar todos os produtos e status
  console.log('\nTodos os produtos na janela de 10 dias:');
  tasks.forEach(t => {
    const status = t.precisaPreenchimento ? '❌ FALTA' : `✅ Já tem: ${t.valorAtual}`;
    console.log(`  [linha ${t.rowIdx + 1}] ${t.produto} | ${t.diaNome} | col[${t.colDia}] | ${status}`);
  });

  console.log('\nProdutos que precisam ser preenchidos HOJE:');
  const pendentes = tasks.filter(t => t.precisaPreenchimento);
  pendentes.forEach(t => {
    console.log(`  - ${t.produto} (${t.diaNome}) | Link: ${t.link ? 'sim' : 'NÃO TEM'}`);
  });

  console.log('\nJSON completo dos pendentes:');
  console.log(JSON.stringify(pendentes, null, 2));
}

main().catch(console.error);
