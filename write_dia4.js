const {google} = require('googleapis');
const fs = require('fs');

const dados = JSON.parse(fs.readFileSync('scratch_dia4.json','utf-8'));
const resultados = dados.resultados;
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json','utf-8'));
const sheets = google.sheets('v4');

(async()=>{
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  console.log(`\n💾 Gravando ${resultados.length} produtos em DIA 4 (Coluna J)...\n`);
  let ok=0, err=0;

  for(const r of resultados){
    const cell = `J${r.rowIdx+1}`;
    try{
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg',
        range: cell,
        valueInputOption: 'USER_ENTERED',
        requestBody: {values: [[r.valor]]}
      });
      process.stdout.write('.');
      ok++;
    }catch(e){
      process.stdout.write('E');
      err++;
    }
  }

  console.log(`\n\n✅ Gravação concluída!\n✓ ${ok}/${resultados.length} gravados\n`);

  if(ok > 0) {
    const total = resultados.reduce((sum, r) => sum + r.valor, 0);
    const com = resultados.filter(r => r.valor > 0).length;
    console.log(`📊 Com anúncios: ${com} | Total: ${total}\n`);
  }
})();
