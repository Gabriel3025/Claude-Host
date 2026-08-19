const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const resultados = JSON.parse(fs.readFileSync('scratch_resultado_dia2.json', 'utf-8')).resultados;
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json', 'utf-8'));
const sheets = google.sheets('v4');

(async () => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(creds);

  console.log(`\n📝 Gravando ${resultados.length} produtos em DIA 2 (Coluna H)...\n`);

  let gravados = 0;
  let erros = 0;

  for (const r of resultados) {
    const sheetRow = r.rowIdx + 1;
    const cell = `Acompanhamento!H${sheetRow}`;

    try {
      await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: cell,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[r.valor]] },
      });

      process.stdout.write('.');
      gravados++;
    } catch (e) {
      process.stdout.write('E');
      erros++;
    }
  }

  console.log(`\n\n✅ Gravação DIA 2 Concluída!\n`);
  console.log(`✓ ${gravados} células atualizadas`);
  if (erros > 0) console.log(`⚠️  ${erros} erros`);

  console.log(`\n📊 Resumo:`);
  const com_anuncios = resultados.filter(r => r.valor > 0).length;
  const sem_anuncios = resultados.filter(r => r.valor === 0).length;
  const total_anuncios = resultados.reduce((sum, r) => sum + r.valor, 0);

  console.log(`   🔥 Produtos com anúncios: ${com_anuncios}`);
  console.log(`   ⚪ Produtos sem anúncios: ${sem_anuncios}`);
  console.log(`   📈 Total de anúncios: ${total_anuncios}\n`);

  // Limpar arquivos temporários
  try {
    fs.unlinkSync('scratch_resultado_dia2.json');
    fs.unlinkSync('collect_dia2_all.js');
    fs.unlinkSync('write_dia2_batch.js');
  } catch (e) {}
})();
