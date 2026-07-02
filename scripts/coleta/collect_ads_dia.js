const puppeteer = require('puppeteer');

const productos = [
  { rowIdx: 1, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 8, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { rowIdx: 20, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 30, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 32, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 33, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 34, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 35, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 39, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { rowIdx: 40, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { rowIdx: 41, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { rowIdx: 42, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 43, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { rowIdx: 44, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { rowIdx: 52, produto: "Atividades Copa do mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179" },
  { rowIdx: 53, produto: "Calistenia asiática", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 56, produto: "Hora da Leiturinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347" },
  { rowIdx: 58, produto: "Cafajeste (Acompanhar OF)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848" },
  { rowIdx: 60, produto: "Painel Campeões", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 61, produto: "Dinamicas aulas de PTBR", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215" },
  { rowIdx: 62, produto: "Planilha financeira", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839" },
  { rowIdx: 63, produto: "Atividades da Pro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 64, produto: "Calistenia asiática 2", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 65, produto: "Atividades de português", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410" },
  { rowIdx: 66, produto: "Atividades em segundos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190" },
  { rowIdx: 67, produto: "Figurinhaa do filho", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877" },
  { rowIdx: 68, produto: "Potinho da fé", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167" },
  { rowIdx: 69, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764" },
  { rowIdx: 70, produto: "ABA no Autismo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=2355407888026229" },
  { rowIdx: 71, produto: "KIT de costura (Acomapnhar)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103027082609605" },
  { rowIdx: 72, produto: "Baralho do coração aberto", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1009496725582636" },
  { rowIdx: 73, produto: "Jogo da Memória da Copa", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1329141256012536&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1041598825693538" },
  // DIA 4
  { rowIdx: 74, produto: "Colorir Copa do Mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1920654611973945&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1108292285704598" },
  { rowIdx: 75, produto: "Artes para Terraplanagem", link: "https://www.facebook.com/ads/library/?id=711781368658553" },
  { rowIdx: 76, produto: "Logo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2146722662816707&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=277295208806442" },
  { rowIdx: 77, produto: "TDAH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1314783087281541&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=363096403554825" },
  { rowIdx: 78, produto: "Segredo do bebe", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1895457088077461&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477" },
  { rowIdx: 79, produto: "80 recursos terapeuticos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2014856769454001&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=456601417538756" },
  { rowIdx: 80, produto: "Acelerar aprendizado da cria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2419112398599913&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079576205235125" },
  { rowIdx: 81, produto: "Quadro com versículos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963" },
  { rowIdx: 82, produto: "Bolsas Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 83, produto: "Hora de aprender cristão", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774" },
  // DIA 3
  { rowIdx: 84, produto: "Materiais para professores", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2185778578837548&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=128822573650748" },
  { rowIdx: 85, produto: "Pack Figurinhas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=929442639749702&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=123045347437517" },
  { rowIdx: 86, produto: "Pack Figurinhas Copa", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=921717424316509&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1027166040489643" }
];

async function collectAds() {
  const browser = await puppeteer.launch({ headless: true });
  const results = [];

  for (const item of productos) {
    try {
      const page = await browser.newPage();
      await page.goto(item.link, { waitUntil: 'networkidle2', timeout: 30000 });
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 1000));

      const valor = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~(\d+)\s+resultados/);
        return match ? parseInt(match[1]) : 0;
      });

      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        valor: valor
      });

      console.log(`✅ ${item.produto}: ${valor}`);
      await page.close();
    } catch (err) {
      console.error(`❌ ${item.produto}: ${err.message}`);
      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        valor: 0,
        erro: err.message
      });
    }
  }

  await browser.close();

  console.log('\n📊 RESUMO:');
  console.log(JSON.stringify(results, null, 2));

  return results;
}

collectAds();
