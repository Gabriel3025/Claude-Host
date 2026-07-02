const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// colDia é 0-based (6=G, 7=H, ... 13=N, 14=O)
function colIdxToLetter(idx) {
  return String.fromCharCode(65 + idx); // 6->G, 7->H, ...
}

(async () => {
  const results = JSON.parse(fs.readFileSync('results_24jun.json'));

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

  console.log('\n📝 Gravando resultados na planilha...\n');

  // Validação pré-gravação
  console.log('🔍 Validação:');
  results.forEach(r => {
    const col = colIdxToLetter(r.colDia);
    const cell = `${col}${r.sheetRow}`;
    console.log(`  ${r.produto.padEnd(35)} → ${cell} = ${r.valor} (rowIdx ${r.rowIdx} + 1 = sheetRow ${r.sheetRow})`);
  });

  console.log('\n');

  const requests = results.map(item => ({
    range: `Página1!${colIdxToLetter(item.colDia)}${item.sheetRow}`,
    values: [[item.valor]]
  }));

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    resource: {
      data: requests,
      valueInputOption: 'RAW'
    }
  });

  console.log('✅ Gravação concluída!');
  console.log(`📊 ${results.length} células atualizadas\n`);

  const dia9 = results.filter(r => r.diaNome === 'DIA 9');
  const dia8 = results.filter(r => r.diaNome === 'DIA 8');

  if (dia9.length > 0) {
    console.log(`📋 DIA 9 (coluna O) — ${dia9.length} produtos:`);
    dia9.forEach(r => console.log(`  ${r.produto.padEnd(35)} → ${r.valor} anúncios`));
  }

  if (dia8.length > 0) {
    console.log(`\n📋 DIA 8 (coluna N) — ${dia8.length} produtos:`);
    dia8.forEach(r => console.log(`  ${r.produto.padEnd(35)} → ${r.valor} anúncios`));
  }

  const total = results.reduce((s, r) => s + r.valor, 0);
  console.log(`\n🏆 Total de anúncios registrados: ${total}`);
})().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
