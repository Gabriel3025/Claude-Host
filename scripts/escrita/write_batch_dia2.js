const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// Dados coletados hoje (10/06/2026) - DIA 2
// Coluna H (colDia: 7) para DIA 2
const resultados = [
  { rowIdx: 1, produto: 'Tarot', valor: 68 },  // já gravado (pular)
  { rowIdx: 8, produto: 'Como plantar', valor: 5 },  // já gravado (pular)
  { rowIdx: 12, produto: 'Neuropro', valor: 56 },  // já gravado (pular)
  { rowIdx: 20, produto: 'Airfryer', valor: 53 },
  { rowIdx: 30, produto: 'Saude (Euro)', valor: 31 },
  { rowIdx: 32, produto: 'Emagrecimento', valor: 0 },
  { rowIdx: 33, produto: 'Atividade cursiva', valor: 0 },
  { rowIdx: 34, produto: 'Jiujistu', valor: 0 },
  { rowIdx: 35, produto: 'Alfabetização', valor: 0 },
  { rowIdx: 36, produto: 'Pacotes de músicas', valor: 0 },
  { rowIdx: 39, produto: '100 Brincadeiras Bebês', valor: 0 },
  { rowIdx: 40, produto: 'Organização do Lar', valor: 0 },
  { rowIdx: 41, produto: 'DryWall', valor: 0 },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', valor: 0 },
  { rowIdx: 43, produto: 'Planilha Capivarinha', valor: 0 },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', valor: 0 },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', valor: 0 },
  { rowIdx: 53, produto: 'Calistenia asiática', valor: 0 },
  { rowIdx: 56, produto: 'Hora da Leiturinha', valor: 0 },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', valor: 0 },
  { rowIdx: 60, produto: 'Painel Campeões', valor: 0 },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', valor: 0 },
  { rowIdx: 62, produto: 'Planilha financeira', valor: 0 },
  { rowIdx: 63, produto: 'Atividades da Pro', valor: 0 },
  { rowIdx: 64, produto: 'Calistenia asiática 2', valor: 0 },
  { rowIdx: 65, produto: 'Atividades de português', valor: 0 },
  { rowIdx: 66, produto: 'Atividades em segundos', valor: 0 },
  { rowIdx: 67, produto: 'Figurinhaa do filho', valor: 0 },
  { rowIdx: 68, produto: 'Potinho da fé', valor: 0 },
  { rowIdx: 69, produto: 'Alfabetização', valor: 0 },
  { rowIdx: 70, produto: 'ABA no Autismo', valor: 0 },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)', valor: 0 },
  { rowIdx: 72, produto: 'Baralho do coração aberto', valor: 0 },
  { rowIdx: 73, produto: 'Jogo da Memória da Copa', valor: 0 },
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

// Filtrar já preenchidos (Tarot, Como plantar, Neuropro)
const dataToWrite = acompanhamentoData.filter(d => !['Tarot', 'Como plantar', 'Neuropro'].includes(d.produto));

async function writeToSheet(sheets, spreadsheetId, data) {
  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  console.log('\n📝 Preparando para gravar (excluindo já preenchidos):');
  data.slice(0, 10).forEach(d => {
    console.log(`   ${d.produto}: ${d.range} = ${d.value}`);
  });
  if (data.length > 10) {
    console.log(`   ... e mais ${data.length - 10} produtos`);
  }

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  console.log(`\n✅ Gravação concluída!`);
  console.log(`   ${response.data.totalUpdatedCells} células gravadas`);
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

    console.log('📤 Gravando Acompanhamento Ofertas - Batch DIA 2 (10/06/2026)...');
    await writeToSheet(sheets, ACOMP_ID, dataToWrite);

    console.log('\n🎉 Acompanhamento de Ofertas concluído!');
    console.log(`   Total: ${resultados.length} produtos`);
    console.log(`   Gravados: ${dataToWrite.length} (excluindo 3 pré-preenchidos)`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
