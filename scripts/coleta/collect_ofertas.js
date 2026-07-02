const { chromium } = require('playwright');

async function collectData() {
  const linksMap = {
    1: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050",
    8: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc",
    12: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469",
    20: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604",
    30: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107",
    32: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306",
    33: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all",
    34: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc",
    35: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc",
    36: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038",
    39: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo",
    40: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343",
    41: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593",
    42: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814",
    43: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901",
    44: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585",
    52: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179",
    53: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687",
    56: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347",
    58: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848",
    60: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150",
    61: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215",
    62: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839",
    63: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150",
    64: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687",
    65: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410",
    66: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190",
    67: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877",
    68: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167",
    69: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764",
    70: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=2355407888026229",
    71: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103027082609605",
    72: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1009496725582636",
    73: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&id=1329141256012536&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1041598825693538",
    74: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1920654611973945&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1108292285704598",
    75: "https://www.facebook.com/ads/library/?id=711781368658553",
    76: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2146722662816707&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=277295208806442",
    77: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1314783087281541&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=363096403554825",
    78: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1895457088077461&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477",
    79: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2014856769454001&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=456601417538756",
    80: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2419112398599913&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079576205235125",
    81: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963",
    82: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445",
    83: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774",
    84: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2185778578837548&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=128822573650748",
    85: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=929442639749702&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=123045347437517",
    86: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=921717424316509&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1027166040489643",
  };

  const products = [
    { rowIdx: 1, colDia: 13, produto: "Tarot" },
    { rowIdx: 8, colDia: 13, produto: "Como plantar" },
    { rowIdx: 12, colDia: 13, produto: "Neuropro" },
    { rowIdx: 20, colDia: 13, produto: "Airfryer" },
    { rowIdx: 30, colDia: 13, produto: "Saude (Euro)" },
    { rowIdx: 32, colDia: 13, produto: "Emagrecimento" },
    { rowIdx: 33, colDia: 13, produto: "Atividade cursiva" },
    { rowIdx: 34, colDia: 13, produto: "Jiujistu" },
    { rowIdx: 35, colDia: 13, produto: "Alfabetização" },
    { rowIdx: 36, colDia: 13, produto: "Pacotes de músicas" },
    { rowIdx: 39, colDia: 13, produto: "100 Brincadeiras Bebês" },
    { rowIdx: 40, colDia: 13, produto: "Organização do Lar" },
    { rowIdx: 41, colDia: 13, produto: "DryWall" },
    { rowIdx: 42, colDia: 13, produto: "100 Cards Anti-Bullying" },
    { rowIdx: 43, colDia: 13, produto: "Planilha Capivarinha" },
    { rowIdx: 44, colDia: 13, produto: "JiuJistsu (LATAM)" },
    { rowIdx: 52, colDia: 13, produto: "Atividades Copa do mundo" },
    { rowIdx: 53, colDia: 13, produto: "Calistenia asiática" },
    { rowIdx: 56, colDia: 13, produto: "Hora da Leiturinha" },
    { rowIdx: 58, colDia: 13, produto: "Cafajeste (Acompanhar OF)" },
    { rowIdx: 60, colDia: 13, produto: "Painel Campeões" },
    { rowIdx: 61, colDia: 13, produto: "Dinamicas aulas de PTBR" },
    { rowIdx: 62, colDia: 13, produto: "Planilha financeira" },
    { rowIdx: 63, colDia: 13, produto: "Atividades da Pro" },
    { rowIdx: 64, colDia: 13, produto: "Calistenia asiática 2" },
    { rowIdx: 65, colDia: 13, produto: "Atividades de português" },
    { rowIdx: 66, colDia: 13, produto: "Atividades em segundos" },
    { rowIdx: 67, colDia: 13, produto: "Figurinhaa do filho" },
    { rowIdx: 68, colDia: 13, produto: "Potinho da fé" },
    { rowIdx: 69, colDia: 13, produto: "Alfabetização" },
    { rowIdx: 70, colDia: 13, produto: "ABA no Autismo" },
    { rowIdx: 71, colDia: 13, produto: "KIT de costura (Acomapnhar)" },
    { rowIdx: 72, colDia: 13, produto: "Baralho do coração aberto" },
    { rowIdx: 73, colDia: 13, produto: "Jogo da Memória da Copa" },
    { rowIdx: 74, colDia: 11, produto: "Colorir Copa do Mundo" },
    { rowIdx: 75, colDia: 11, produto: "Artes para Terraplanagem" },
    { rowIdx: 76, colDia: 11, produto: "Logo" },
    { rowIdx: 77, colDia: 11, produto: "TDAH" },
    { rowIdx: 78, colDia: 11, produto: "Segredo do bebe" },
    { rowIdx: 79, colDia: 11, produto: "80 recursos terapeuticos" },
    { rowIdx: 80, colDia: 11, produto: "Acelerar aprendizado da cria" },
    { rowIdx: 81, colDia: 11, produto: "Quadro com versículos" },
    { rowIdx: 82, colDia: 11, produto: "Bolsas Croche" },
    { rowIdx: 83, colDia: 11, produto: "Hora de aprender cristão" },
    { rowIdx: 84, colDia: 10, produto: "Materiais para professores" },
    { rowIdx: 85, colDia: 10, produto: "Pack Figurinhas" },
    { rowIdx: 86, colDia: 10, produto: "Pack Figurinhas Copa" },
  ];

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  console.log(`🚀 Iniciando coleta de ${products.length} produtos...\n`);

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const url = linksMap[prod.rowIdx];

    if (!url) {
      console.log(`⚠️  [${i+1}/${products.length}] ${prod.produto} (${prod.rowIdx}) - SEM LINK`);
      continue;
    }

    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      const valor = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~(\d+)\s+resultados/);
        return match ? match[1] : '0';
      });

      results.push({
        rowIdx: prod.rowIdx,
        colDia: prod.colDia,
        produto: prod.produto,
        valor: parseInt(valor)
      });

      console.log(`✅ [${i+1}/${products.length}] ${prod.produto} → ${valor} anúncios`);
    } catch (err) {
      console.log(`⚠️  [${i+1}/${products.length}] ${prod.produto} - ERRO`);
      results.push({
        rowIdx: prod.rowIdx,
        colDia: prod.colDia,
        produto: prod.produto,
        valor: 0
      });
    }
  }

  await browser.close();

  const dia5 = results.filter(r => r.colDia === 10);
  const dia6 = results.filter(r => r.colDia === 11);
  const dia8 = results.filter(r => r.colDia === 13);

  console.log(`\n📊 RESUMO COLETADO:`);
  console.log(`  DIA 5 (K): ${dia5.length} produtos = ${dia5.reduce((s,r) => s + r.valor, 0)} anúncios`);
  console.log(`  DIA 6 (L): ${dia6.length} produtos = ${dia6.reduce((s,r) => s + r.valor, 0)} anúncios`);
  console.log(`  DIA 8 (N): ${dia8.length} produtos = ${dia8.reduce((s,r) => s + r.valor, 0)} anúncios`);
  console.log(`  TOTAL: ${results.length} produtos = ${results.reduce((s,r) => s + r.valor, 0)} anúncios\n`);

  return results;
}

collectData().then(results => {
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}).catch(err => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
