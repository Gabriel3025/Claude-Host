const { chromium } = require('playwright');

const links = [
  { id: 1,  produto: "100 Brincadeiras Bebês",  link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { id: 2,  produto: "Moldes em FOAM (Dol)",    link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415" },
  { id: 3,  produto: "Organização do Lar",      link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { id: 4,  produto: "DryWall",                link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { id: 5,  produto: "Tarot",                  link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { id: 6,  produto: "Como plantar",           link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 7,  produto: "Neuropro",               link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { id: 8,  produto: "120 dinamicas infan",    link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684" },
  { id: 9,  produto: "Moldes EVA",             link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335" },
  { id: 10, produto: "Airfryer",               link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { id: 11, produto: "Saude (Euro)",           link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { id: 12, produto: "100 Cards Anti-Bullying",link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { id: 13, produto: "Planilha Capivarinha",   link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { id: 14, produto: "JiuJistsu (LATAM)",      link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { id: 15, produto: "Calcinhas (DROP)",       link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1684748261643829" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const item of links) {
    const page = await browser.newPage();
    try {
      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(4000);

      // Fechar popup se existir
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      // Tirar screenshot
      await page.screenshot({ path: `screenshot_${item.id}.png` });

      // Tentar ler o número de resultados
      const text = await page.evaluate(() => document.body.innerText);

      // Procurar por padrão "~X resultados" ou "X results" ou variações
      const matchPt = text.match(/~?([\d.,]+)\s*resultados?/i);
      const matchEn = text.match(/~?([\d.,]+)\s*results?/i);
      const match = matchPt || matchEn;

      let valor = 0;
      if (match) {
        // Remover pontos/vírgulas de milhar e converter
        const numStr = match[1].replace(/\./g, '').replace(/,/g, '');
        valor = parseInt(numStr, 10);
      }

      console.log(`[${item.id}] ${item.produto}: ${valor}`);
      results.push({ ...item, valor });
    } catch (err) {
      console.log(`[${item.id}] ${item.produto}: ERRO - ${err.message}`);
      results.push({ ...item, valor: 0, erro: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n=== RESULTADOS FINAIS ===');
  console.log(JSON.stringify(results, null, 2));
})();
