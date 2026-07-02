const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function getColunaDIA(dia) {
  const colByDia = { 1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K', 6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P' };
  return colByDia[dia];
}

async function writeToSheet(sheets, spreadsheetId, data) {
  if (!data || data.length === 0) {
    console.log('⚠️  Nenhum dado para gravar');
    return 0;
  }

  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  console.log('\n📝 Preparando para gravar:');
  data.forEach(d => {
    console.log(`   ${d.produto}: ${d.range} = ${d.value}`);
  });

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  return response.data.totalUpdatedCells;
}

async function main() {
  try {
    const resultFile = process.argv[2] || 'ofertas_resultado_final.json';

    if (!fs.existsSync(resultFile)) {
      console.error(`❌ Arquivo não encontrado: ${resultFile}`);
      process.exit(1);
    }

    const fileContent = fs.readFileSync(resultFile, 'utf8');
    let results = [];

    try {
      results = JSON.parse(fileContent);
    } catch (e) {
      console.error('❌ Erro ao fazer parse do JSON:', e.message);
      process.exit(1);
    }

    if (!Array.isArray(results) || results.length === 0) {
      console.error('❌ Nenhum resultado encontrado');
      process.exit(1);
    }

    const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
    const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const clientKeys = oauthKeys.installed || oauthKeys.web;

    const auth = new google.auth.OAuth2(clientKeys.client_id, clientKeys.client_secret, clientKeys.redirect_uris[0]);
    auth.setCredentials(savedCredentials);

    const sheets = google.sheets({ version: 'v4', auth });

    const colDiaMap = { 10: 5, 11: 6, 13: 8 };

    const acompanhamentoData = results.map(r => {
      const sheetRow = r.rowIdx + 1;
      const dia = colDiaMap[r.colDia] || 0;
      const coluna = getColunaDIA(dia);
      return {
        range: `${coluna}${sheetRow}`,
        value: r.valor,
        produto: r.produto,
        dia: dia,
      };
    });

    const dia5 = acompanhamentoData.filter(d => d.dia === 5);
    const dia6 = acompanhamentoData.filter(d => d.dia === 6);
    const dia8 = acompanhamentoData.filter(d => d.dia === 8);

    console.log('📤 Gravando Acompanhamento Ofertas...');
    console.log(`\n🎯 DIA 5: ${dia5.length} produtos`);
    const total5 = await writeToSheet(sheets, ACOMP_ID, dia5);

    console.log(`\n🎯 DIA 6: ${dia6.length} produtos`);
    const total6 = await writeToSheet(sheets, ACOMP_ID, dia6);

    console.log(`\n🎯 DIA 8: ${dia8.length} produtos`);
    const total8 = await writeToSheet(sheets, ACOMP_ID, dia8);

    console.log(`\n✅ TOTAL GRAVADO: ${total5 + total6 + total8} células`);
    console.log(`   DIA 5: ${total5}`);
    console.log(`   DIA 6: ${total6}`);
    console.log(`   DIA 8: ${total8}`);

    console.log('\n🎉 Acompanhamento Ofertas concluído com sucesso!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
