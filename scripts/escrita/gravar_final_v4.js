const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');

async function gravar() {
  console.log('📝 TENTATIVA 4: OAuth2Client correto\n');
  
  const dados = JSON.parse(fs.readFileSync('coleta_60_metodo_original.json', 'utf8'));
  
  try {
    const creds = JSON.parse(fs.readFileSync('.gdrive-server-credentials.json', 'utf8'));
    const auth = new OAuth2Client();
    auth.setCredentials({
      access_token: creds.access_token,
      refresh_token: creds.refresh_token || undefined
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
    
    let gravadas = 0;
    let total = 0;
    
    console.log('Gravando célula por célula...\n');
    
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
      }
    }
    
    console.log(`\n\n✅ CONCLUÍDO:`);
    console.log(`   • ${gravadas}/${dados.length} células gravadas`);
    console.log(`   • Total: ${total} anúncios`);
    process.exit(0);
    
  } catch(e) {
    console.error('❌ Erro:', e.message);
    process.exit(1);
  }
}

gravar();
