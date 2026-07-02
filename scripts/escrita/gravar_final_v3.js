const { google } = require('googleapis');
const fs = require('fs');

async function gravar() {
  console.log('📝 TENTATIVA 3: Usando credenciais alternativas\n');
  
  const dados = JSON.parse(fs.readFileSync('coleta_60_metodo_original.json', 'utf8'));
  
  // Tentar com arquivo original de credenciais do servidor
  let auth;
  try {
    const creds = JSON.parse(fs.readFileSync('.gdrive-server-credentials.json', 'utf8'));
    auth = new google.auth.OAuth2Client();
    auth.setCredentials({
      access_token: creds.access_token,
      refresh_token: creds.refresh_token || undefined,
      expiry_date: creds.expiry_date || undefined
    });
    console.log('✅ Usando OAuth2 com refresh token\n');
  } catch(e) {
    console.error('❌ Erro ao carregar credenciais:', e.message);
    process.exit(1);
  }
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
  
  let gravadas = 0;
  let total = 0;
  let erros = [];
  
  for (const d of dados) {
    const sheetRow = d.rowIdx + 1;
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
      erros.push(`${range}: ${e.message}`);
    }
  }
  
  console.log(`\n\n✅ RESULTADO:`);
  console.log(`   • ${gravadas}/${dados.length} células gravadas`);
  console.log(`   • Total de anúncios: ${total}`);
  
  if (erros.length > 0) {
    console.log(`\n⚠️ ${erros.length} erros:`);
    erros.slice(0, 3).forEach(e => console.log(`   - ${e}`));
  }
}

gravar().catch(e => console.error('❌ Erro fatal:', e.message));
