const { google } = require('googleapis');
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const results = JSON.parse(fs.readFileSync('dia9_results_complete.json'));

function getColunaDIA(dia) {
  const colMap = { 1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K', 6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P' };
  return colMap[dia] || 'O';
}

(async () => {
  try {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials(credentials);

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('\n📝 Gravando 44 produtos em DIA 9 (coluna O)...\n');

    // Preparar requests de atualização
    const requests = results.map(item => {
      const col = getColunaDIA(item.dia);
      const range = `Página1!${col}${item.sheetRow}`;
      
      return {
        range,
        values: [[item.valor]]
      };
    });

    // Gravar em batch
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      resource: {
        data: requests,
        valueInputOption: 'RAW'
      }
    });

    console.log('✅ Dados gravados com sucesso!');
    console.log(`📊 ${results.length} células atualizadas\n`);

    // Exibir resumo
    console.log('📋 Resumo da gravação (primeiros 20):');
    results.slice(0, 20).forEach(r => {
      console.log(`  ${r.produto.padEnd(35)} → ${r.valor} anúncios`);
    });
    console.log(`  ... (${results.length - 20} mais produtos)`);

    const total = results.reduce((sum, r) => sum + r.valor, 0);
    console.log(`\n📊 Total geral: ${total} anúncios em 44 produtos`);
    console.log(`\n✅ DIA 9 COMPLETO - TODOS OS DADOS GRAVADOS!`);
    
  } catch (error) {
    console.error('❌ Erro ao gravar:', error.message);
    process.exit(1);
  }
})();
