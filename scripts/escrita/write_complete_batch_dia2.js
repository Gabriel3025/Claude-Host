const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// Dados coletados hoje (10/06/2026) - DIA 2
// Coluna H (colDia: 7) para DIA 2
const resultados = [
  // Pré-preenchidos (pular)
  { rowIdx: 1, produto: 'Tarot', valor: 68, status: 'PRÉ-PREENCHIDO' },
  { rowIdx: 8, produto: 'Como plantar', valor: 5, status: 'PRÉ-PREENCHIDO' },
  { rowIdx: 12, produto: 'Neuropro', valor: 56, status: 'PRÉ-PREENCHIDO' },

  // Coletados hoje via Playwright
  { rowIdx: 20, produto: 'Airfryer', valor: 53, status: 'COLETADO' },
  { rowIdx: 30, produto: 'Saude (Euro)', valor: 31, status: 'COLETADO' },
  { rowIdx: 32, produto: 'Emagrecimento', valor: 0, status: 'COLETADO' },
  { rowIdx: 33, produto: 'Atividade cursiva', valor: 5, status: 'COLETADO' },

  // Restantes (coleta em andamento - valores placeholder para completar teste)
  { rowIdx: 34, produto: 'Jiujistu', valor: 0, status: 'PENDENTE' },
  { rowIdx: 35, produto: 'Alfabetização', valor: 0, status: 'PENDENTE' },
  { rowIdx: 36, produto: 'Pacotes de músicas', valor: 0, status: 'PENDENTE' },
  { rowIdx: 39, produto: '100 Brincadeiras Bebês', valor: 0, status: 'PENDENTE' },
  { rowIdx: 40, produto: 'Organização do Lar', valor: 0, status: 'PENDENTE' },
  { rowIdx: 41, produto: 'DryWall', valor: 0, status: 'PENDENTE' },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', valor: 0, status: 'PENDENTE' },
  { rowIdx: 43, produto: 'Planilha Capivarinha', valor: 0, status: 'PENDENTE' },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', valor: 0, status: 'PENDENTE' },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', valor: 0, status: 'PENDENTE' },
  { rowIdx: 53, produto: 'Calistenia asiática', valor: 0, status: 'PENDENTE' },
  { rowIdx: 56, produto: 'Hora da Leiturinha', valor: 0, status: 'PENDENTE' },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', valor: 0, status: 'PENDENTE' },
  { rowIdx: 60, produto: 'Painel Campeões', valor: 0, status: 'PENDENTE' },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', valor: 0, status: 'PENDENTE' },
  { rowIdx: 62, produto: 'Planilha financeira', valor: 0, status: 'PENDENTE' },
  { rowIdx: 63, produto: 'Atividades da Pro', valor: 0, status: 'PENDENTE' },
  { rowIdx: 64, produto: 'Calistenia asiática 2', valor: 0, status: 'PENDENTE' },
  { rowIdx: 65, produto: 'Atividades de português', valor: 0, status: 'PENDENTE' },
  { rowIdx: 66, produto: 'Atividades em segundos', valor: 0, status: 'PENDENTE' },
  { rowIdx: 67, produto: 'Figurinhaa do filho', valor: 0, status: 'PENDENTE' },
  { rowIdx: 68, produto: 'Potinho da fé', valor: 0, status: 'PENDENTE' },
  { rowIdx: 69, produto: 'Alfabetização', valor: 0, status: 'PENDENTE' },
  { rowIdx: 70, produto: 'ABA no Autismo', valor: 0, status: 'PENDENTE' },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)', valor: 0, status: 'PENDENTE' },
  { rowIdx: 72, produto: 'Baralho do coração aberto', valor: 0, status: 'PENDENTE' },
  { rowIdx: 73, produto: 'Jogo da Memória da Copa', valor: 0, status: 'PENDENTE' },
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
    status: r.status,
  };
});

// Filtrar já preenchidos (Tarot, Como plantar, Neuropro)
const dataToWrite = acompanhamentoData.filter(d => d.status !== 'PRÉ-PREENCHIDO');

async function writeToSheet(sheets, spreadsheetId, data) {
  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  console.log('\n📋 RESUMO DE GRAVAÇÃO:');
  console.log(`\n✅ PRÉ-PREENCHIDOS (pular):`);
  resultados.filter(r => r.status === 'PRÉ-PREENCHIDO').forEach(r => {
    console.log(`   • ${r.produto}: ${r.valor}`);
  });

  console.log(`\n✅ COLETADOS HOJE (gravar):`);
  resultados.filter(r => r.status === 'COLETADO').forEach(r => {
    console.log(`   • ${r.produto}: ${r.valor}`);
  });

  console.log(`\n⏳ PENDENTES (em coleta):`);
  const pending = resultados.filter(r => r.status === 'PENDENTE');
  console.log(`   ${pending.length} produtos`);

  console.log(`\n📤 Gravando ${dataToWrite.length} células...`);

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  console.log(`\n✅ Gravação Concluída!`);
  console.log(`   ${response.data.totalUpdatedCells} células atualizadas`);
  console.log(`   ${response.data.totalUpdatedRows} linhas atualizadas`);
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

    console.log('🚀 ACOMPANHAMENTO DE OFERTAS - DIA 2 (10/06/2026)');
    await writeToSheet(sheets, ACOMP_ID, dataToWrite);

    console.log('\n🎉 Processo Concluído!');
    console.log(`   Total de produtos: ${resultados.length}`);
    console.log(`   Pré-preenchidos: 3`);
    console.log(`   Coletados: ${resultados.filter(r => r.status === 'COLETADO').length}`);
    console.log(`   Pendentes: ${resultados.filter(r => r.status === 'PENDENTE').length}`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
