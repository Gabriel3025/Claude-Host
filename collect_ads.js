const { chromium } = require('playwright');

const links = [
  { id: 1, produto: "Ebook bibílico (Infant)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 2, produto: "Ficha de Treino", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 3, produto: "1.200 Moldes de Papel", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848" },
  { id: 4, produto: "Exerc. Anatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 5, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { id: 6, produto: "Moldes em FOAM (Dol)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415" },
  { id: 7, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { id: 8, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { id: 9, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { id: 10, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 11, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { id: 12, produto: "120 dinamicas infan", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684" },
  { id: 13, produto: "Moldes EVA", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335" },
  { id: 14, produto: "Calistenia kids", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=calisteniakids.com.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { id: 15, produto: "Calcinhas (DROP)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1684748261643829" },
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
