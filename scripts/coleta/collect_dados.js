const { chromium } = require('playwright');
const fs = require('fs');

const produtos = [
  { rowIdx: 1, colDia: 15, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 8, colDia: 15, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, colDia: 15, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { rowIdx: 20, colDia: 15, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 30, colDia: 15, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 32, colDia: 15, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 33, colDia: 15, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 34, colDia: 15, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 35, colDia: 15, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, colDia: 15, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 39, colDia: 15, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { rowIdx: 40, colDia: 15, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { rowIdx: 41, colDia: 15, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { rowIdx: 42, colDia: 15, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 43, colDia: 15, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { rowIdx: 44, colDia: 15, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { rowIdx: 52, colDia: 15, produto: "Atividades Copa do mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179" },
  { rowIdx: 53, colDia: 15, produto: "Calistenia asiática", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 56, colDia: 15, produto: "Hora da Leiturinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347" },
  { rowIdx: 58, colDia: 15, produto: "Cafajeste (Acompanhar OF)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848" },
  { rowIdx: 60, colDia: 15, produto: "Painel Campeões", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 61, colDia: 15, produto: "Dinamicas aulas de PTBR", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215" },
  { rowIdx: 62, colDia: 15, produto: "Planilha financeira", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839" },
  { rowIdx: 63, colDia: 15, produto: "Atividades da Pro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 64, colDia: 15, produto: "Calistenia asiática 2 ", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 65, colDia: 15, produto: "Atividades de português", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410" },
  { rowIdx: 66, colDia: 15, produto: "Atividades em segundos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190" },
  { rowIdx: 67, colDia: 15, produto: "Figurinhaa do filho", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877" },
  { rowIdx: 68, colDia: 15, produto: "Potinho da fé", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167" },
  { rowIdx: 69, colDia: 15, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764" },
  { rowIdx: 70, colDia: 15, produto: "ABA no Autismo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=2355407888026229" },
  { rowIdx: 71, colDia: 15, produto: "KIT de costura (Acomapnhar)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103027082609605" },
  { rowIdx: 72, colDia: 15, produto: "Baralho do coração aberto", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1009496725582636" },
  { rowIdx: 73, colDia: 15, produto: "Jogo da Memória da Copa", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1329141256012536&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1041598825693538" },
  { rowIdx: 74, colDia: 13, produto: "Colorir Copa do Mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1920654611973945&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1108292285704598" },
  { rowIdx: 75, colDia: 13, produto: "Artes para Terraplanagem", link: "https://www.facebook.com/ads/library/?id=711781368658553" },
  { rowIdx: 76, colDia: 13, produto: "Logo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2146722662816707&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=277295208806442" },
  { rowIdx: 77, colDia: 13, produto: "TDAH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1314783087281541&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=363096403554825" },
  { rowIdx: 78, colDia: 13, produto: "Segredo do bebe", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1895457088077461&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477" },
  { rowIdx: 79, colDia: 13, produto: "80 recursos terapeuticos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2014856769454001&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=456601417538756" },
  { rowIdx: 80, colDia: 13, produto: "Acelerar aprendizado da cria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2419112398599913&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079576205235125" },
  { rowIdx: 81, colDia: 13, produto: "Quadro com versículos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963" },
  { rowIdx: 82, colDia: 13, produto: "Bolsas Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 83, colDia: 13, produto: "Hora de aprender cristão", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774" },
  { rowIdx: 84, colDia: 12, produto: "Materiais para professores", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2185778578837548&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=128822573650748" },
  { rowIdx: 85, colDia: 12, produto: "Pack Figurinhas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=929442639749702&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=123045347437517" },
  { rowIdx: 86, colDia: 12, produto: "Pack Figurinhas Copa ", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=921717424316509&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1027166040489643" },
  { rowIdx: 87, colDia: 8, produto: "Exercícios para TDAH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1539757124446179&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1032487749942829" },
  { rowIdx: 88, colDia: 8, produto: "Molde Roupa PET", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2186336145475706&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=798961839967726" },
  { rowIdx: 89, colDia: 8, produto: "Cristão + Hidroponica", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1157518119898256&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=764990176689674" },
  { rowIdx: 90, colDia: 8, produto: "TCC com IA (R$ 297,00)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1331009742267761&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103564767838055" },
  { rowIdx: 91, colDia: 8, produto: "Catalogo Estética automotiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2036457113610000&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=931344583397575" },
  { rowIdx: 92, colDia: 8, produto: "Atividades para idosos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1672177637162368&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=118549594571851" },
  { rowIdx: 93, colDia: 8, produto: "Atividades para copa", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=979861398247494&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=969531866239736" },
  { rowIdx: 94, colDia: 8, produto: "Adesivo Sono", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1319715983491748&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=902865936254343" },
  { rowIdx: 95, colDia: 8, produto: "Simulado CNH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889272863572796&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=685480034656998" },
  { rowIdx: 96, colDia: 8, produto: "Matemática Minecraft", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1466436528832369&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1025559857302305" },
  { rowIdx: 97, colDia: 8, produto: "Desafio 21 dias Emagrec.", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=985099327616657&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=131485520040550" },
  { rowIdx: 98, colDia: 8, produto: "Brinquedos de Papel", link: "https://www.facebook.com/ads/library/?id=1321227846541377" },
  { rowIdx: 99, colDia: 7, produto: "A história do lider (Política)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27476307511973173&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=984175081437878" }
];

async function extrairValor(page, link) {
  try {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    const valor = await page.evaluate(() => {
      const match = document.body.innerText.match(/~(\d+)\s+resultados/);
      return match ? match[1] : "0";
    });

    return valor;
  } catch (e) {
    console.error(`Erro ao processar link: ${e.message}`);
    return "0";
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const resultados = [];

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    console.log(`[${i+1}/${produtos.length}] Coletando: ${p.produto}`);

    const valor = await extrairValor(page, p.link);
    resultados.push({
      rowIdx: p.rowIdx,
      colDia: p.colDia,
      produto: p.produto,
      valor: valor
    });

    console.log(`  ✓ ${p.produto}: ${valor} anúncios`);
  }

  await browser.close();

  fs.writeFileSync('resultados.json', JSON.stringify(resultados, null, 2));
  console.log(`\n✅ Coleta concluída! ${resultados.length} produtos processados.`);
  console.log('Resultados salvos em resultados.json');
}

main();
