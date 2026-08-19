const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const resultados = JSON.parse(fs.readFileSync('scratch_resultado_dia2.json', 'utf-8')).resultados;
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json', 'utf-8'));
const sheets = google.sheets('v4');

(async () => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  console.log(`\n📝 Testando gravação de 1 produto (teste)...\n`);

  const r = resultados[0];
  const sheetRow = r.rowIdx + 1;
  const cell = `H${sheetRow}`;

  try {
    console.log(`Gravando: ${r.produto} (${r.valor}) em ${cell}...`);
    const res = await sheets.spreadsheets.values.update({
      auth,
      spreadsheetId: SPREADSHEET_ID,
      range: cell,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [[r.valor]] },
    });
    console.log('✅ Sucesso!', res.data);
  } catch (e) {
    console.error('❌ Erro:', e.message);
    console.error('Status:', e.code);
    console.error('Details:', e.errors);
  }
})();
