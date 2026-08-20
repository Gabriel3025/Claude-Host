const { google } = require('googleapis');
const fs = require('fs');

const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const dados = JSON.parse(fs.readFileSync('scratch_resultado_dia3.json', 'utf-8'));
const resultados = dados.resultados;
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json', 'utf-8'));

(async () => {
  try {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: creds.access_token,
      refresh_token: creds.refresh_token,
      scope: creds.scope,
      token_type: creds.token_type,
      expiry_date: creds.expiry_date,
    });

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

    console.log(`\n📝 Gravando ${resultados.length} produtos em DIA 3 (Coluna I)...\n`);

    let gravados = 0;
    let erros = 0;

    for (let i = 0; i < resultados.length; i++) {
      const r = resultados[i];
      const sheetRow = r.rowIdx + 1;
      const cell = `I${sheetRow}`;

      try {
        await sheets.spreadsheets.values.update({
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

      if ((i + 1) % 20 === 0) {
        process.stdout.write(` ${i + 1}/${resultados.length}\n`);
      }
    }

    console.log(`\n\n✅ Gravação DIA 3 Concluída!\n`);
    console.log(`✓ ${gravados} células atualizadas`);
    if (erros > 0) console.log(`⚠️  ${erros} erros`);

    console.log(`\n📊 Resumo:`);
    const com_anuncios = resultados.filter(r => r.valor > 0).length;
    const sem_anuncios = resultados.filter(r => r.valor === 0).length;
    const total_anuncios = resultados.reduce((sum, r) => sum + r.valor, 0);

    console.log(`   🔥 Com anúncios: ${com_anuncios}`);
    console.log(`   ⚪ Sem anúncios: ${sem_anuncios}`);
    console.log(`   📈 Total: ${total_anuncios} anúncios`);
    console.log(`\n⏳ Nota: ${dados.falhas.length} produtos ainda precisam reprocessamento`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
})();
