const {google} = require('googleapis');
const fs = require('fs');

const dados = JSON.parse(fs.readFileSync('scratch_resultado_dia3.json','utf-8'));
const resultados = dados.resultados;
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json','utf-8'));
const sheets = google.sheets('v4');

(async()=>{
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  console.log(`\n💾 Gravando ${resultados.length} produtos na coluna I (DIA 3)...\n`);
  let ok=0, err=0;

  for(const r of resultados){
    const col = 'I';
    const cell = `${col}${r.rowIdx+1}`;
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

  console.log(`\n\n✅ Gravação DIA 3 concluída!\n✓ ${ok} gravados\n⚠️  ${err} erros\n`);

  if(ok > 0) {
    console.log(`📊 Resumo:`);
    const com_anuncios = resultados.filter(r => r.valor > 0).length;
    const sem_anuncios = resultados.filter(r => r.valor === 0).length;
    const total_anuncios = resultados.reduce((sum, r) => sum + r.valor, 0);
    console.log(`   🔥 Com anúncios: ${com_anuncios}`);
    console.log(`   ⚪ Sem anúncios: ${sem_anuncios}`);
    console.log(`   📈 Total: ${total_anuncios} anúncios\n`);
  }
})();
