const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const resultados = [
  // DIA 6 (coluna L = 12)
  { rowIdx: 1, dia: 6, coluna: 12, produto: "Tarot", valor: 57 },
  { rowIdx: 8, dia: 6, coluna: 12, produto: "Como plantar", valor: 5 },
  { rowIdx: 12, dia: 6, coluna: 12, produto: "Neuropro", valor: 55 },
  { rowIdx: 20, dia: 6, coluna: 12, produto: "Airfryer", valor: 24 },
  { rowIdx: 30, dia: 6, coluna: 12, produto: "Saude (Euro)", valor: 85 },
  { rowIdx: 32, dia: 6, coluna: 12, produto: "Emagrecimento", valor: 0 },
  { rowIdx: 33, dia: 6, coluna: 12, produto: "Atividade cursiva", valor: 10 },
  { rowIdx: 34, dia: 6, coluna: 12, produto: "Jiujistu", valor: 17 },
  { rowIdx: 35, dia: 6, coluna: 12, produto: "Alfabetização", valor: 0 },
  { rowIdx: 36, dia: 6, coluna: 12, produto: "Pacotes de músicas", valor: 0 },
  { rowIdx: 39, dia: 6, coluna: 12, produto: "100 Brincadeiras Bebês", valor: 6 },
  { rowIdx: 40, dia: 6, coluna: 12, produto: "Organização do Lar", valor: 91 },
  { rowIdx: 41, dia: 6, coluna: 12, produto: "DryWall", valor: 0 },
  { rowIdx: 42, dia: 6, coluna: 12, produto: "100 Cards Anti-Bullying", valor: 0 },
  { rowIdx: 43, dia: 6, coluna: 12, produto: "Planilha Capivarinha", valor: 23 },
  { rowIdx: 44, dia: 6, coluna: 12, produto: "JiuJistsu (LATAM)", valor: 15 },
  { rowIdx: 52, dia: 6, coluna: 12, produto: "Atividades Copa do mundo", valor: 14 },
  { rowIdx: 53, dia: 6, coluna: 12, produto: "Calistenia asiática", valor: 89 },
  { rowIdx: 56, dia: 6, coluna: 12, produto: "Hora da Leiturinha", valor: 23 },
  { rowIdx: 58, dia: 6, coluna: 12, produto: "Cafajeste (Acompanhar OF)", valor: 3 },
  { rowIdx: 60, dia: 6, coluna: 12, produto: "Painel Campeões", valor: 25 },
  { rowIdx: 61, dia: 6, coluna: 12, produto: "Dinamicas aulas de PTBR", valor: 4 },
  { rowIdx: 62, dia: 6, coluna: 12, produto: "Planilha financeira", valor: 0 },
  { rowIdx: 63, dia: 6, coluna: 12, produto: "Atividades da Pro", valor: 25 },
  { rowIdx: 64, dia: 6, coluna: 12, produto: "Calistenia asiática 2", valor: 89 },
  { rowIdx: 65, dia: 6, coluna: 12, produto: "Atividades de português", valor: 0 },
  { rowIdx: 66, dia: 6, coluna: 12, produto: "Atividades em segundos", valor: 13 },
  { rowIdx: 67, dia: 6, coluna: 12, produto: "Figurinhaa do filho", valor: 55 },
  { rowIdx: 68, dia: 6, coluna: 12, produto: "Potinho da fé", valor: 6 },
  { rowIdx: 69, dia: 6, coluna: 12, produto: "Alfabetização", valor: 48 },
  { rowIdx: 70, dia: 6, coluna: 12, produto: "ABA no Autismo", valor: 17 },
  { rowIdx: 71, dia: 6, coluna: 12, produto: "KIT de costura (Acomapnhar)", valor: 8 },
  { rowIdx: 72, dia: 6, coluna: 12, produto: "Baralho do coração aberto", valor: 35 },
  { rowIdx: 73, dia: 6, coluna: 12, produto: "Jogo da Memória da Copa", valor: 87 },
  // DIA 4 (coluna J = 10)
  { rowIdx: 74, dia: 4, coluna: 10, produto: "Colorir Copa do Mundo", valor: 2 },
  { rowIdx: 75, dia: 4, coluna: 10, produto: "Artes para Terraplanagem", valor: 58 },
  { rowIdx: 76, dia: 4, coluna: 10, produto: "Logo", valor: 140 },
  { rowIdx: 77, dia: 4, coluna: 10, produto: "TDAH", valor: 20 },
  { rowIdx: 78, dia: 4, coluna: 10, produto: "Segredo do bebe", valor: 17 },
  { rowIdx: 79, dia: 4, coluna: 10, produto: "80 recursos terapeuticos", valor: 50 },
  { rowIdx: 80, dia: 4, coluna: 10, produto: "Acelerar aprendizado da cria", valor: 0 },
  { rowIdx: 81, dia: 4, coluna: 10, produto: "Quadro com versículos", valor: 15 },
  { rowIdx: 82, dia: 4, coluna: 10, produto: "Bolsas Croche", valor: 44 },
  { rowIdx: 83, dia: 4, coluna: 10, produto: "Hora de aprender cristão", valor: 0 },
  // DIA 3 (coluna I = 9)
  { rowIdx: 84, dia: 3, coluna: 9, produto: "Materiais para professores", valor: 93 },
  { rowIdx: 85, dia: 3, coluna: 9, produto: "Pack Figurinhas", valor: 59 },
  { rowIdx: 86, dia: 3, coluna: 9, produto: "Pack Figurinhas Copa", valor: 0 }
];

function numToCol(num) {
  let col = '';
  while (num > 0) {
    col = String.fromCharCode((num - 1) % 26 + 65) + col;
    num = Math.floor((num - 1) / 26);
  }
  return col;
}

async function writeToSheets() {
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

    const updates = resultados.map(r => {
      const sheetRow = r.rowIdx + 1;
      const col = numToCol(r.coluna);
      const range = `${col}${sheetRow}`;
      return {
        range: range,
        values: [[r.valor]]
      };
    });

    console.log(`\n📝 Gravando ${resultados.length} valores na planilha...`);

    const batchUpdateRequest = {
      data: updates,
      valueInputOption: 'RAW'
    };

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: batchUpdateRequest
    });

    console.log('\n✅ GRAVAÇÃO CONCLUÍDA!');

    const dia3 = resultados.filter(r => r.dia === 3);
    const dia4 = resultados.filter(r => r.dia === 4);
    const dia6 = resultados.filter(r => r.dia === 6);
    const totalAds = resultados.reduce((a, b) => a + b.valor, 0);

    console.log(`\n📊 RESUMO EXECUTIVO:
    ✅ Produtos: ${resultados.length}
    ✅ Anúncios totais: ${totalAds}
    ✅ DIA 3 (I): ${dia3.length} produtos
    ✅ DIA 4 (J): ${dia4.length} produtos
    ✅ DIA 6 (L): ${dia6.length} produtos
    `);

    console.log('\n📋 DETALHAMENTO:');
    console.log('\nDIA 3:');
    dia3.forEach(r => {
      const col = numToCol(r.coluna);
      const sheetRow = r.rowIdx + 1;
      console.log(`  ${col}${sheetRow}: ${r.produto} = ${r.valor}`);
    });
    console.log('\nDIA 4:');
    dia4.forEach(r => {
      const col = numToCol(r.coluna);
      const sheetRow = r.rowIdx + 1;
      console.log(`  ${col}${sheetRow}: ${r.produto} = ${r.valor}`);
    });
    console.log('\nDIA 6:');
    dia6.forEach(r => {
      const col = numToCol(r.coluna);
      const sheetRow = r.rowIdx + 1;
      console.log(`  ${col}${sheetRow}: ${r.produto} = ${r.valor}`);
    });

  } catch (error) {
    console.error('❌ Erro na gravação:', error.message);
    process.exit(1);
  }
}

writeToSheets();
