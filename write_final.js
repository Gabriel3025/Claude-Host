const {google} = require('googleapis');
const fs = require('fs');

const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json','utf-8'));
const results = JSON.parse(fs.readFileSync('final_results.json','utf-8'));
const sheets = google.sheets('v4');

(async()=>{
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);
  
  console.log(`Gravando ${results.length} produtos...`);
  let ok=0, err=0;
  
  for(const r of results){
    const col = String.fromCharCode(64+8); // H = coluna 8
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
  
  console.log(`\n✅ ${ok} gravados | ⚠️ ${err} erros`);
})();
