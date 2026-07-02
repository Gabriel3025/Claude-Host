const { google } = require('googleapis');
const fs = require('fs');

async function gravar() {
  // Aguardar arquivo
  console.log('⏳ Aguardando arquivo de coleta...');
  for (let i = 0; i < 120; i++) {
    if (fs.existsSync('coleta_60_metodo_original.json')) {
      console.log('✅ Arquivo encontrado!');
      break;
    }
    await new Promise(r => setTimeout(r, 5000));
  }
  
  if (!fs.existsSync('coleta_60_metodo_original.json')) {
    console.error('❌ Timeout aguardando coleta');
    process.exit(1);
  }
  
  const dados = JSON.parse(fs.readFileSync('coleta_60_metodo_original.json', 'utf8'));
  
  console.log(`\n📝 GRAVANDO ${dados.length} REGISTROS\n`);
  
  const credentials = JSON.parse(fs.readFileSync('.gdrive-server-credentials.json', 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
  
  let gravadas = 0;
  let total = 0;
  
  for (const d of dados) {
    const sheetRow = d.rowIdx + 1;
    // colDia 14 = N, colDia 11 = K, etc
    const coluna = String.fromCharCode(64 + d.colDia);
    const range = `${coluna}${sheetRow}`;
    
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[d.valor]] }
      });
      process.stdout.write('.');
      gravadas++;
      total += d.valor;
    } catch (e) {
      process.stdout.write('❌');
    }
  }
  
  console.log(`\n\n✅ GRAVAÇÃO CONCLUÍDA:`);
  console.log(`   • ${gravadas}/${dados.length} células gravadas`);
  console.log(`   • Total de anúncios: ${total}`);
}

gravar().catch(e => console.error('❌ Erro:', e.message));
