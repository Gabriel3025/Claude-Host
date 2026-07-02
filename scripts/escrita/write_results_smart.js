const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Dados coletados em 02/06/2026
const resultados = [
  { rowIdx: 1, produto: 'Atividade cursiva', dia: 10, count: 5 },
  { rowIdx: 8, produto: 'Jiujistu', dia: 10, count: 17 },
  { rowIdx: 12, produto: 'Alfabetização', dia: 10, count: 0 },
  { rowIdx: 20, produto: 'Pacotes de músicas', dia: 10, count: 15 },
  { rowIdx: 21, produto: '200 dinamicas cristã', dia: 10, count: 0 },
  { rowIdx: 24, produto: 'Croche', dia: 10, count: 0 },
  { rowIdx: 26, produto: 'Ebook bibílico (Infant)', dia: 10, count: 0 },
  { rowIdx: 27, produto: 'Ficha de Treino', dia: 10, count: 16 },
  { rowIdx: 28, produto: '1.200 Moldes de Papel', dia: 10, count: 0 },
  { rowIdx: 29, produto: 'Exerc. Anatomia', dia: 10, count: 0 },
  { rowIdx: 30, produto: '100 Brincadeiras Bebês', dia: 10, count: 14 },
  { rowIdx: 31, produto: 'Moldes em FOAM (Dol)', dia: 10, count: 0 },
  { rowIdx: 32, produto: 'Organização do Lar', dia: 10, count: 110 },
  { rowIdx: 33, produto: 'DryWall', dia: 10, count: 0 },
  { rowIdx: 34, produto: 'Tarot', dia: 10, count: 50 },
  { rowIdx: 35, produto: 'Como plantar', dia: 10, count: 5 },
  { rowIdx: 36, produto: 'Neuropro', dia: 10, count: 77 },
  { rowIdx: 37, produto: '120 dinamicas infan', dia: 10, count: 0 },
  { rowIdx: 38, produto: 'Moldes EVA', dia: 10, count: 0 },
  { rowIdx: 39, produto: 'Airfryer', dia: 10, count: 9 },
  { rowIdx: 40, produto: 'Saude (Euro)', dia: 10, count: 70 },
  { rowIdx: 41, produto: 'Emagrecimento', dia: 10, count: 120 },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', dia: 10, count: 0 },
  { rowIdx: 43, produto: 'Planilha Capivarinha', dia: 10, count: 22 },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', dia: 10, count: 26 },
  { rowIdx: 45, produto: 'Kit Casinhas de Boneca', dia: 10, count: 0 },
  { rowIdx: 46, produto: 'Kit Figurinhas Educativas', dia: 10, count: 0 },
  { rowIdx: 47, produto: 'Fichas e Resumos de Letras', dia: 10, count: 0 },
  { rowIdx: 48, produto: 'Projeto Marcenaria', dia: 10, count: 0 },
  { rowIdx: 49, produto: 'Bijuteria', dia: 10, count: 0 },
  { rowIdx: 50, produto: 'Alfabetização', dia: 10, count: 1 },
  { rowIdx: 51, produto: 'Creme AntRugas (DROP)', dia: 10, count: 18 },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', dia: 10, count: 0 },
  { rowIdx: 53, produto: 'Calistenia asiática', dia: 10, count: 100 },
  { rowIdx: 54, produto: 'Religião LATAM', dia: 10, count: 0 },
  { rowIdx: 55, produto: 'Dinamicas terapeuticas', dia: 10, count: 0 },
  { rowIdx: 56, produto: 'Hora da Leiturinha', dia: 10, count: 16 },
  { rowIdx: 57, produto: 'EUAMOAnatomia', dia: 10, count: 0 },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', dia: 10, count: 3 },
  { rowIdx: 59, produto: 'Sono bebe', dia: 10, count: 0 },
  { rowIdx: 60, produto: 'Painel Campeões', dia: 10, count: 0 },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', dia: 10, count: 5 },
  { rowIdx: 62, produto: 'Planilha financeira', dia: 10, count: 0 },
  { rowIdx: 63, produto: 'Atividades da Pro', dia: 10, count: 11 },
  { rowIdx: 64, produto: 'Calistenia asiática 2 ', dia: 10, count: 100 },
  { rowIdx: 65, produto: 'Atividades de português', dia: 10, count: 22 },
  { rowIdx: 66, produto: 'Atividades em segundos', dia: 10, count: 8 },
  { rowIdx: 67, produto: 'Figurinhaa do filho', dia: 10, count: 78 },
  { rowIdx: 68, produto: 'Potinho da fé', dia: 8, count: 0 },
  { rowIdx: 69, produto: 'Alfabetização', dia: 7, count: 0 },
  { rowIdx: 70, produto: 'ABA no Autismo', dia: 7, count: 0 },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)', dia: 7, count: 0 },
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
  return colByDia[dia];
}

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

    // Preparar dados para gravação
    const acompanhamentoData = resultados.map(r => {
      const sheetRow = r.rowIdx + 1;
      const coluna = getColunaDIA(r.dia, 'acompanhamento');
      return {
        range: `${coluna}${sheetRow}`,
        value: r.count,
        produto: r.produto,
      };
    });

    const radarData = resultados.map(r => {
      const sheetRow = r.rowIdx + 1;
      const coluna = getColunaDIA(r.dia, 'radar');
      return {
        range: `${coluna}${sheetRow}`,
        value: r.count,
        produto: r.produto,
      };
    });

    console.log('📤 Gravando Acompanhamento Ofertas...');
    await writeToSheet(sheets, ACOMP_ID, acompanhamentoData, 'Acompanhamento Ofertas');

    console.log('📤 Gravando Radar de Ofertas...');
    await writeToSheet(sheets, RADAR_ID, radarData, 'Radar de Ofertas');

    // Resumo por DIA
    const diamCount = {};
    resultados.forEach(r => {
      diamCount[`DIA ${r.dia}`] = (diamCount[`DIA ${r.dia}`] || 0) + 1;
    });

    console.log('\n🎉 Conferência concluída!');
    console.log(`   Total: ${resultados.length} produtos`);
    Object.entries(diamCount).forEach(([dia, count]) => {
      console.log(`   ${dia}: ${count} produtos`);
    });
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
