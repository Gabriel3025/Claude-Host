const {google} = require('googleapis');
const fs = require('fs');

const results = JSON.parse(fs.readFileSync('results_final.json','utf-8'));
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json','utf-8'));
const sheets = google.sheets('v4');

(async()=>{
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);
  
  console.log(`\n💾 Gravando ${results.length} produtos na coluna I (DIA 3)...\n`);
  let ok=0, err=0;
  
  for(const r of results){
    const col = 'I'; // Coluna 9 = I
    const cell = `${col}${r.rowIdx+1}`;
    try{
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg',
        range: cell,
        valueInputOption: 'USER_ENTERED',
        requestBody: {values: [[r.count]]}
      });
      process.stdout.write('.');
      ok++;
    }catch(e){
      process.stdout.write('E');
      err++;
    }
  }
  
  console.log(`\n\n✅ Gravação concluída!\n✓ ${ok} gravados\n⚠️  ${err} erros\n`);
})();
