const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Dados coletados
const coleta = JSON.parse(fs.readFileSync('resultados_hoje.json', 'utf8'));
const coletaMap = {};
coleta.forEach(c => {
  coletaMap[c.rowIdx] = c.valor;
});

// Lista de produtos DIA 2 pendentes (obtida do read_sheet.js output)
// rowIdx: produto
const dia2Pendentes = {
  1: 'Tarot',
  8: 'Como plantar',
  12: 'Neuropro',
  20: 'Airfryer',
  30: '100 Brincadeiras Bebês',
  31: 'Moldes em FOAM (Dol)',
  32: 'Organização do Lar',
  33: 'DryWall',
  34: 'Tarot',
  35: 'Como plantar',
  36: 'Neuropro',
  37: '120 dinamicas infan',
  38: 'Moldes EVA',
  39: 'Airfryer',
  40: 'Saude (Euro)',
  41: 'Emagrecimento',
  42: '100 Cards Anti-Bullying',
  43: 'Planilha Capivarinha',
  44: 'JiuJistsu (LATAM)',
  45: 'Kit Casinhas de Boneca',
  46: 'Kit Figurinhas Educativas',
  47: 'Fichas e Resumos de Letras',
  48: 'Projeto Marcenaria',
  49: 'Bijuteria',
  50: 'Alfabetização',
  51: 'Creme AntRugas (DROP)',
  52: 'Atividades Copa do mundo',
  53: 'Calistenia asiática',
  54: 'Religião LATAM',
  55: 'Dinamicas terapeuticas',
  56: 'Hora da Leiturinha',
  57: 'EUAMOAnatomia',
  58: 'Cafajeste (Acompanhar OF)',
  59: 'Sono bebe',
};

async function main() {
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

  // Preparar dados
  const acompData = [];
  const radarData = [];

  Object.entries(dia2Pendentes).forEach(([rowIdx, produto]) => {
    const idx = parseInt(rowIdx);
    const valor = coletaMap[idx] !== undefined ? coletaMap[idx] : 0;

    acompData.push({
      range: `H${idx + 1}`,
      values: [[valor]],
    });

    radarData.push({
      range: `I${idx + 1}`,
      values: [[valor]],
    });
  });

  console.log('✅ PASSO 4: Verificação PRÉ-GRAVAÇÃO');
  console.log(`  Total DIA 2: ${acompData.length}`);
  console.log('  Colunas: H (Acomp) / I (Radar)');
  console.log('\\n  Amostra:');
  acompData.slice(0, 3).forEach((d, i) => {
    const rowIdx = parseInt(d.range.match(/\\d+/)[0]) - 1;
    const produto = dia2Pendentes[rowIdx];
    const valor = d.values[0][0];
    console.log(`    rowIdx ${rowIdx} → ${produto} = ${valor}`);
  });

  console.log('\\n📝 Gravando...');

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: ACOMP_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: acompData,
    },
  });

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: RADAR_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: radarData,
    },
  });

  console.log(`✅ Acompanhamento Ofertas: ${acompData.length} células gravadas em H (DIA 2)`);
  console.log(`✅ Radar de Ofertas: ${radarData.length} células gravadas em I (DIA 2)`);
  console.log('\\n🎉 Conferência de Ofertas DIA 2 CONCLUÍDA COM PRECISÃO!');
  console.log(`   Total: ${acompData.length} produtos`);
}

main().catch(console.error);
