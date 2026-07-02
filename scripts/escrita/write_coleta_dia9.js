const { google } = require('googleapis');
const fs = require('fs');

async function writeColeta() {
  // Aguardar arquivo de coleta
  if (!fs.existsSync('coleta_completa_robusto.json')) {
    console.log('⏳ Aguardando conclusão da coleta...');
    let tentativas = 0;
    while (!fs.existsSync('coleta_completa_robusto.json') && tentativas < 120) {
      await new Promise(r => setTimeout(r, 5000));
      tentativas++;
    }
  }
  
  if (!fs.existsSync('coleta_completa_robusto.json')) {
    console.error('❌ Arquivo de coleta não encontrado após 10 minutos');
    process.exit(1);
  }
  
  const resultados = JSON.parse(fs.readFileSync('coleta_completa_robusto.json', 'utf8'));
  
  console.log(`\n📝 INICIANDO GRAVAÇÃO: ${resultados.length} células`);
  console.log('═'.repeat(70));
  
  const credentials = JSON.parse(fs.readFileSync('.gdrive-server-credentials.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
  
  let gravadas = 0;
  let erros = 0;
  
  for (const r of resultados) {
    const sheetRow = r.rowIdx + 1;
    // DIA 9 = colDia 14 = coluna N
    const coluna = String.fromCharCode(64 + r.colDia);
    const range = `${coluna}${sheetRow}`;
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[r.valor]] }
      });
      process.stdout.write('.');
      gravadas++;
    } catch (e) {
      process.stdout.write('❌');
      erros++;
    }
  }
  
  console.log(`\n\n✅ GRAVAÇÃO CONCLUÍDA:`);
  console.log(`   • ${gravadas}/${resultados.length} células gravadas`);
  if (erros > 0) console.log(`   • ${erros} erros de gravação`);
  const total = resultados.reduce((s, r) => s + r.valor, 0);
  console.log(`   • Total de anúncios: ${total}`);
}

writeColeta().catch(e => console.error('❌ Erro:', e.message));
