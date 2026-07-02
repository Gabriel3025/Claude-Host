const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// Dados coletados hoje (10/06/2026) - DIA 2
const resultados = [
  { rowIdx: 1, produto: 'Tarot', dia: 2, count: 68 },
  { rowIdx: 8, produto: 'Como plantar', dia: 2, count: 5 },
  { rowIdx: 12, produto: 'Neuropro', dia: 2, count: 56 },
];

function getColunaDIA(dia) {
  const colByDia = {
    1: 'G',
    2: 'H',
    3: 'I',
    4: 'J',
    5: 'K',
    6: 'L',
    7: 'M',
    8: 'N',
    9: 'O',
    10: 'P',
  };
  return colByDia[dia];
}

// Preparar dados para gravação
const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  const coluna = getColunaDIA(r.dia);
  return {
    range: `${coluna}${sheetRow}`,
    value: r.count,
    produto: r.produto,
  };
});

async function writeToSheet(sheets, spreadsheetId, data) {
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

  console.log(`\n✅ Acompanhamento Ofertas: ${response.data.totalUpdatedCells} células gravadas`);
}

async function main() {
  try {
    const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
    const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const clientKeys = oauthKeys.installed || oauthKeys.web;

    const auth = new google.auth.OAuth2(
      clientKeys.client_id,
      clientKeys.client_secret,
      clientKeys.redirect_uris[0]
    );
    auth.setCredentials(savedCredentials);

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('📤 Gravando Acompanhamento Ofertas - DIA 2 (10/06/2026)...');
    await writeToSheet(sheets, ACOMP_ID, acompanhamentoData);

    console.log('\n🎉 Conferência DIA 2 concluída com sucesso!');
    console.log(`   Total: ${resultados.length} produtos`);
    resultados.forEach(r => {
      console.log(`   ✓ ${r.produto}: ${r.count} anúncios`);
    });
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
