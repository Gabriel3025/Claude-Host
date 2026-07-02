const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// TODOS OS 34 PRODUTOS COM VALORES REAIS COLETADOS (10/06/2026 - DIA 2)
const resultados = [
  { rowIdx: 1, produto: 'Tarot', valor: 68, status: 'COLETADO' },
  { rowIdx: 8, produto: 'Como plantar', valor: 5, status: 'COLETADO' },
  { rowIdx: 12, produto: 'Neuropro', valor: 56, status: 'COLETADO' },
  { rowIdx: 20, produto: 'Airfryer', valor: 53, status: 'COLETADO' },
  { rowIdx: 30, produto: 'Saude (Euro)', valor: 31, status: 'COLETADO' },
  { rowIdx: 32, produto: 'Emagrecimento', valor: 0, status: 'COLETADO' },
  { rowIdx: 33, produto: 'Atividade cursiva', valor: 5, status: 'COLETADO' },
  { rowIdx: 34, produto: 'Jiujistu', valor: 17, status: 'COLETADO' },
  { rowIdx: 35, produto: 'Alfabetização', valor: 0, status: 'COLETADO' },
  { rowIdx: 36, produto: 'Pacotes de músicas', valor: 3, status: 'COLETADO' },
  { rowIdx: 39, produto: '100 Brincadeiras Bebês', valor: 5, status: 'COLETADO' },
  { rowIdx: 40, produto: 'Organização do Lar', valor: 120, status: 'COLETADO' },
  { rowIdx: 41, produto: 'DryWall', valor: 0, status: 'COLETADO' },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', valor: 8, status: 'COLETADO' },
  { rowIdx: 43, produto: 'Planilha Capivarinha', valor: 21, status: 'COLETADO' },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', valor: 25, status: 'COLETADO' },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', valor: 0, status: 'COLETADO' },
  { rowIdx: 53, produto: 'Calistenia asiática', valor: 120, status: 'COLETADO' },
  { rowIdx: 56, produto: 'Hora da Leiturinha', valor: 16, status: 'COLETADO' },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', valor: 3, status: 'COLETADO' },
  { rowIdx: 60, produto: 'Painel Campeões', valor: 15, status: 'COLETADO' },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', valor: 8, status: 'COLETADO' },
  { rowIdx: 62, produto: 'Planilha financeira', valor: 0, status: 'COLETADO' },
  { rowIdx: 63, produto: 'Atividades da Pro', valor: 15, status: 'COLETADO' },
  { rowIdx: 64, produto: 'Calistenia asiática 2', valor: 120, status: 'COLETADO' },
  { rowIdx: 65, produto: 'Atividades de português', valor: 7, status: 'COLETADO' },
  { rowIdx: 66, produto: 'Atividades em segundos', valor: 0, status: 'COLETADO' },
  { rowIdx: 67, produto: 'Figurinhaa do filho', valor: 63, status: 'COLETADO' },
  { rowIdx: 68, produto: 'Potinho da fé', valor: 0, status: 'COLETADO' },
  { rowIdx: 69, produto: 'Alfabetização', valor: 52, status: 'COLETADO' },
  { rowIdx: 70, produto: 'ABA no Autismo', valor: 22, status: 'COLETADO' },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)', valor: 17, status: 'COLETADO' },
  { rowIdx: 72, produto: 'Baralho do coração aberto', valor: 12, status: 'COLETADO' },
  { rowIdx: 73, produto: 'Jogo da Memória da Copa', valor: 62, status: 'COLETADO' },
];

function getColunaDIA(dia) {
  const colByDia = { 1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K', 6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P' };
  return colByDia[dia];
}

const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  const coluna = getColunaDIA(2); // DIA 2 = coluna H
  return {
    range: `${coluna}${sheetRow}`,
    value: r.valor,
    produto: r.produto,
  };
});

async function writeToSheet(sheets, spreadsheetId, data) {
  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  console.log('\n📋 ACOMPANHAMENTO DE OFERTAS - DIA 2 (10/06/2026)');
  console.log(`📊 Total de produtos: ${data.length}`);
  console.log(`✅ Status: TODOS OS VALORES REAIS COLETADOS VIA PLAYWRIGHT\n`);

  console.log('Gravando na planilha...\n');

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  console.log(`✅ Gravação Concluída!`);
  console.log(`   ${response.data.totalUpdatedCells} células gravadas`);
  console.log(`   ${response.data.totalUpdatedRows} linhas atualizadas\n`);

  // Exibir resumo
  console.log('📊 RESUMO FINAL:');
  console.log(`   Total de produtos processados: ${resultados.length}`);
  const soma = resultados.reduce((acc, r) => acc + r.valor, 0);
  console.log(`   Soma total de anúncios: ${soma}`);
  console.log(`   Produtos com 0 anúncios: ${resultados.filter(r => r.valor === 0).length}`);
  console.log(`   Produtos com anúncios: ${resultados.filter(r => r.valor > 0).length}`);
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

    await writeToSheet(sheets, ACOMP_ID, acompanhamentoData);

    console.log('🎉 ACOMPANHAMENTO DE OFERTAS FINALIZADO COM SUCESSO!');
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
