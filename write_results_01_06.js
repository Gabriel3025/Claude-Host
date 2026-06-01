const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Dados coletados hoje (01/06/2026) via conferencia-batch.js
const resultados = [
  { rowIdx: 1, produto: 'Atividade cursiva', count: 5 },
  { rowIdx: 8, produto: 'Jiujistu', count: 7 },
  { rowIdx: 12, produto: 'Alfabetização', count: 0 },
  { rowIdx: 20, produto: 'Pacotes de músicas', count: 0 },
  { rowIdx: 21, produto: '200 dinamicas cristã', count: 0 },
  { rowIdx: 24, produto: 'Croche', count: 0 },
  { rowIdx: 26, produto: 'Ebook bibílico (Infant)', count: 0 },
  { rowIdx: 27, produto: 'Ficha de Treino', count: 23 },
  { rowIdx: 28, produto: '1.200 Moldes de Papel', count: 0 },
  { rowIdx: 29, produto: 'Exerc. Anatomia', count: 0 },
  { rowIdx: 30, produto: '100 Brincadeiras Bebês', count: 14 },
  { rowIdx: 31, produto: 'Moldes em FOAM (Dol)', count: 11 },
  { rowIdx: 32, produto: 'Organização do Lar', count: 110 },
  { rowIdx: 33, produto: 'DryWall', count: 0 },
  { rowIdx: 34, produto: 'Tarot', count: 49 },
  { rowIdx: 35, produto: 'Como plantar', count: 5 },
  { rowIdx: 36, produto: 'Neuropro', count: 84 },
  { rowIdx: 37, produto: '120 dinamicas infan', count: 0 },
  { rowIdx: 38, produto: 'Moldes EVA', count: 0 },
  { rowIdx: 39, produto: 'Airfryer', count: 9 },
  { rowIdx: 40, produto: 'Saude (Euro)', count: 55 },
  { rowIdx: 41, produto: 'Emagrecimento', count: 130 },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', count: 0 },
  { rowIdx: 43, produto: 'Planilha Capivarinha', count: 22 },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', count: 19 },
  { rowIdx: 45, produto: 'Kit Casinhas de Boneca', count: 0 },
  { rowIdx: 46, produto: 'Kit Figurinhas Educativas', count: 0 },
  { rowIdx: 47, produto: 'Fichas e Resumos de Letras', count: 0 },
  { rowIdx: 48, produto: 'Projeto Marcenaria', count: 3 },
  { rowIdx: 49, produto: 'Bijuteria', count: 0 },
  { rowIdx: 50, produto: 'Alfabetização', count: 1 },
  { rowIdx: 51, produto: 'Creme AntRugas (DROP)', count: 18 },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', count: 18 },
  { rowIdx: 53, produto: 'Calistenia asiática', count: 120 },
  { rowIdx: 54, produto: 'Religião LATAM', count: 12 },
  { rowIdx: 55, produto: 'Dinamicas terapeuticas', count: 0 },
  { rowIdx: 56, produto: 'Hora da Leiturinha', count: 16 },
  { rowIdx: 57, produto: 'EUAMOAnatomia', count: 0 },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', count: 3 },
  { rowIdx: 59, produto: 'Sono bebe', count: 0 },
  { rowIdx: 60, produto: 'Painel Campeões', count: 9 },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', count: 7 },
  { rowIdx: 62, produto: 'Planilha financeira', count: 0 },
  { rowIdx: 63, produto: 'Atividades da Pro', count: 9 },
  { rowIdx: 64, produto: 'Calistenia asiática 2 ', count: 120 },
  { rowIdx: 65, produto: 'Atividades de português', count: 21 },
  { rowIdx: 66, produto: 'Atividades em segundos', count: 10 },
  { rowIdx: 67, produto: 'Figurinhaa do filho', count: 59 },
  { rowIdx: 68, produto: 'Potinho da fé', count: 21 },
];

function getColunaDIA(dia, sheetType) {
  const colByDia = {
    1: sheetType === 'acompanhamento' ? 'G' : 'H',
    2: sheetType === 'acompanhamento' ? 'H' : 'I',
    3: sheetType === 'acompanhamento' ? 'I' : 'J',
    4: sheetType === 'acompanhamento' ? 'J' : 'K',
    5: sheetType === 'acompanhamento' ? 'K' : 'L',
    6: sheetType === 'acompanhamento' ? 'L' : 'M',
    7: sheetType === 'acompanhamento' ? 'M' : 'N',
    8: sheetType === 'acompanhamento' ? 'N' : 'O',
    9: sheetType === 'acompanhamento' ? 'O' : 'P',
    10: sheetType === 'acompanhamento' ? 'P' : 'Q',
  };
  return colByDia[7]; // DIA 7 para 01/06/2026 (25/05 + 7 dias)
}

// Preparar dados para gravação
const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  const coluna = getColunaDIA(7, 'acompanhamento');
  return {
    range: `${coluna}${sheetRow}`,
    value: r.count,
    produto: r.produto,
  };
});

const radarData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  const coluna = getColunaDIA(7, 'radar');
  return {
    range: `${coluna}${sheetRow}`,
    value: r.count,
    produto: r.produto,
  };
});

async function writeToSheet(sheets, spreadsheetId, data, nome) {
  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  console.log(`✅ ${nome}: ${data.length} células gravadas`);
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

    console.log('📤 Gravando Acompanhamento Ofertas (DIA 7 - coluna M)...');
    await writeToSheet(sheets, ACOMP_ID, acompanhamentoData, 'Acompanhamento Ofertas');

    console.log('📤 Gravando Radar de Ofertas (DIA 7 - coluna N)...');
    await writeToSheet(sheets, RADAR_ID, radarData, 'Radar de Ofertas');

    console.log('\n🎉 Conferência de Ofertas 01/06/2026 concluída!');
    console.log(`   Total: ${resultados.length} produtos`);
    console.log(`   Coluna Acompanhamento: M (DIA 7)`);
    console.log(`   Coluna Radar: N (DIA 7)`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
