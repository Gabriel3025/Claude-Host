const { google } = require('googleapis');
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = JSON.parse(fs.readFileSync('dia9_final_correto.json'));

(async () => {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const auth = new google.auth.OAuth2();
    auth.setCredentials(credentials);
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\n📝 Gravando dados CORRETOS em DIA 9...\n');

    const requests = results.map(item => ({
      range: `Página1!O${item.sheetRow}`,
      values: [[item.valor]]
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      resource: { data: requests, valueInputOption: 'RAW' }
    });

    console.log('✅ Gravação concluída!');
    console.log(`📊 ${results.length} células atualizadas`);
    console.log(`📈 Total: ${results.reduce((sum, r) => sum + r.valor, 0)} anúncios\n`);
    
    console.log('TOP 10 produtos:');
    results.sort((a, b) => b.valor - a.valor).slice(0, 10).forEach(r => {
      console.log(`  rowIdx ${r.rowIdx}: ${r.valor} anúncios`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
})();
