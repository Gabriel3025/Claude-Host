const {sheets} = require('googleapis').google;
const fs = require('fs');
const auth = require('./.gdrive-server-credentials.json');

const results = JSON.parse(fs.readFileSync('final_results.json','utf8'));
const sheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const colDia = 8; // DIA 3 para 27/05/2026

(async()=>{
  const authClient = new (require('googleapis').Auth.GoogleAuth)({
    credentials: auth,
    scopes:['https://www.googleapis.com/auth/spreadsheets']
  });
  const api = sheets({version:'v4',auth:authClient});
  
  const updates = results.map(r=>({
    range:`Sheet1!${String.fromCharCode(64+colDia)}${r.rowIdx+1}`,
    values:[[r.count]]
  }));
  
  await api.spreadsheets.values.batchUpdate({spreadsheetId:sheetId,requestBody:{data:updates}});
  console.log(`✅ ${results.length} valores gravados na planilha`);
})();
