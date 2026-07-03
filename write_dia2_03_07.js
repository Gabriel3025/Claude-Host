const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

// Dados coletados 03/07/2026 - DIA 2 (coluna H) via Playwright, item por item
const resultados = [
  { rowIdx: 1, produto: 'Tarot', count: 26 },
  { rowIdx: 8, produto: 'Como plantar', count: 4 },
  { rowIdx: 12, produto: 'Neuropro', count: 51 },
  { rowIdx: 20, produto: 'Airfryer', count: 30 },
  { rowIdx: 30, produto: 'Saude (Euro)', count: 41 },
  { rowIdx: 32, produto: 'Emagrecimento', count: 7 },
  { rowIdx: 33, produto: 'Atividade cursiva', count: 18 },
  { rowIdx: 34, produto: 'Jiujistu', count: 6 },
  { rowIdx: 35, produto: 'Alfabetização', count: 0 },
  { rowIdx: 36, produto: 'Pacotes de músicas', count: 0 },
  { rowIdx: 39, produto: '100 Brincadeiras Bebês', count: 4 },
  { rowIdx: 40, produto: 'Organização do Lar', count: 99 },
  { rowIdx: 41, produto: 'DryWall', count: 0 },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying', count: 0 },
  { rowIdx: 43, produto: 'Planilha Capivarinha', count: 25 },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)', count: 0 },
  { rowIdx: 52, produto: 'Atividades Copa do mundo', count: 0 },
  { rowIdx: 53, produto: 'Calistenia asiática', count: 110 },
  { rowIdx: 56, produto: 'Hora da Leiturinha', count: 25 },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)', count: 0 },
  { rowIdx: 60, produto: 'Painel Campeões', count: 13 },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR', count: 6 },
  { rowIdx: 62, produto: 'Planilha financeira', count: 0 },
  { rowIdx: 63, produto: 'Atividades da Pro', count: 13 },
  { rowIdx: 64, produto: 'Calistenia asiática 2', count: 110 },
  { rowIdx: 65, produto: 'Atividades de português', count: 57 },
  { rowIdx: 66, produto: 'Atividades em segundos', count: 9 },
  { rowIdx: 67, produto: 'Figurinhaa do filho', count: 10 },
  { rowIdx: 68, produto: 'Potinho da fé', count: 19 },
  { rowIdx: 69, produto: 'Alfabetização', count: 69 },
  { rowIdx: 70, produto: 'ABA no Autismo', count: 11 },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)', count: 20 },
  { rowIdx: 72, produto: 'Baralho do coração aberto', count: 24 },
  { rowIdx: 73, produto: 'Jogo da Memória da Copa', count: 15 },
  { rowIdx: 74, produto: 'Colorir Copa do Mundo', count: 0 },
  { rowIdx: 75, produto: 'Artes para Terraplanagem', count: 87 },
  { rowIdx: 76, produto: 'Logo', count: 0 },
  { rowIdx: 77, produto: 'TDAH', count: 32 },
  { rowIdx: 78, produto: 'Segredo do bebe', count: 8 },
  { rowIdx: 79, produto: '80 recursos terapeuticos', count: 73 },
  { rowIdx: 80, produto: 'Acelerar aprendizado da cria', count: 0 },
  { rowIdx: 81, produto: 'Quadro com versículos', count: 0 },
  { rowIdx: 82, produto: 'Bolsas Croche', count: 38 },
  { rowIdx: 83, produto: 'Hora de aprender cristão', count: 5 },
  { rowIdx: 84, produto: 'Materiais para professores', count: 160 },
  { rowIdx: 85, produto: 'Pack Figurinhas', count: 29 },
  { rowIdx: 86, produto: 'Pack Figurinhas Copa', count: 18 },
  { rowIdx: 87, produto: 'Exercícios para TDAH', count: 11 },
  { rowIdx: 88, produto: 'Molde Roupa PET', count: 18 },
  { rowIdx: 89, produto: 'Cristão + Hidroponica', count: 16 },
  { rowIdx: 90, produto: 'TCC com IA (R$ 297,00)', count: 65 },
  { rowIdx: 91, produto: 'Catalogo Estética automotiva', count: 17 },
  { rowIdx: 92, produto: 'Atividades para idosos', count: 23 },
  { rowIdx: 93, produto: 'Atividades para copa', count: 0 },
  { rowIdx: 94, produto: 'Adesivo Sono', count: 75 },
  { rowIdx: 95, produto: 'Simulado CNH', count: 0 },
  { rowIdx: 96, produto: 'Matemática Minecraft', count: 3 },
  { rowIdx: 97, produto: 'Desafio 21 dias Emagrec.', count: 26 },
  { rowIdx: 98, produto: 'Brinquedos de Papel', count: 24 },
  { rowIdx: 99, produto: 'A história do lider (Política)', count: 0 },
  { rowIdx: 100, produto: 'Dor na coluna (Acompanhar)', count: 19 },
  { rowIdx: 101, produto: '150 Bonecas de Papel', count: 26 },
];

const COLUNA_DIA2 = 'H';

const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  return {
    range: `${COLUNA_DIA2}${sheetRow}`,
    value: r.count,
    produto: r.produto,
  };
});

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

    const updateData = acompanhamentoData.map(d => ({
      range: d.range,
      values: [[d.value]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    });

    console.log(`✅ Acompanhamento Ofertas DIA 2 (03/07/2026): ${acompanhamentoData.length} células gravadas`);
    acompanhamentoData.forEach(d => console.log(`   ${d.range} = ${d.value} (${d.produto})`));
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
