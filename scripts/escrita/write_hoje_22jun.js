const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// Dados coletados hoje (22/06/2026)
const resultados = [
  { rowIdx: 87, produto: 'Exercícios para TDAH', dia: 7, count: 12 },
  { rowIdx: 88, produto: 'Molde Roupa PET', dia: 7, count: 17 },
  { rowIdx: 89, produto: 'Cristão + Hidroponica', dia: 7, count: 25 },
  { rowIdx: 90, produto: 'TCC com IA (R$ 297,00)', dia: 7, count: 84 },
  { rowIdx: 91, produto: 'Catalogo Estética automotiva', dia: 7, count: 10 },
  { rowIdx: 92, produto: 'Atividades para idosos', dia: 7, count: 18 },
  { rowIdx: 93, produto: 'Atividades para copa', dia: 7, count: 0 },
  { rowIdx: 94, produto: 'Adesivo Sono', dia: 7, count: 64 },
  { rowIdx: 95, produto: 'Simulado CNH', dia: 7, count: 13 },
  { rowIdx: 96, produto: 'Matemática Minecraft', dia: 7, count: 7 },
  { rowIdx: 97, produto: 'Desafio 21 dias Emagrec.', dia: 7, count: 34 },
  { rowIdx: 98, produto: 'Brinquedos de Papel', dia: 7, count: 31 },
  { rowIdx: 99, produto: 'A história do lider (Política)', dia: 6, count: 0 },
];

function getColunaDIA(dia) {
  const colByDia = {
    1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K',
    6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P',
  };
  return colByDia[dia];
}

const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  const coluna = getColunaDIA(r.dia);
  return { range: `${coluna}${sheetRow}`, value: r.count, produto: r.produto };
});

async function writeToSheet(sheets, spreadsheetId, data) {
  const updateData = data.map(d => ({ range: d.range, values: [[d.value]] }));

  console.log('\n📝 Preparando para gravar:');
  data.forEach(d => console.log(`   ${d.produto}: ${d.range} = ${d.value}`));

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: updateData },
  });

  console.log(`\n✅ ${response.data.totalUpdatedCells} células gravadas`);
}

async function main() {
  try {
    const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
    const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const clientKeys = oauthKeys.installed || oauthKeys.web;

    const auth = new google.auth.OAuth2(
      clientKeys.client_id, clientKeys.client_secret, clientKeys.redirect_uris[0]
    );
    auth.setCredentials(savedCredentials);

    const sheets = google.sheets({ version: 'v4', auth });

    console.log('📤 Gravando Acompanhamento Ofertas - 22/06/2026...');
    await writeToSheet(sheets, ACOMP_ID, acompanhamentoData);

    console.log('\n🎉 Conferência concluída!');
    console.log(`   Total: ${resultados.length} produtos`);
    const total = resultados.reduce((s, r) => s + r.count, 0);
    resultados.forEach(r => console.log(`   ✓ ${r.produto}: ${r.count} anúncios`));
    console.log(`\n   📊 Total anúncios: ${total}`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
