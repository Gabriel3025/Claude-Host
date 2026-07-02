const { chromium } = require('playwright');

const links = [
  { rowIdx: 45, colDia: 12, produto: "Kit Casinhas de Boneca", diaNome: "DIA 7", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=894236146555718&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=889932910880439" },
  { rowIdx: 46, colDia: 12, produto: "Kit Figurinhas Educativas", diaNome: "DIA 7", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1286271340269388&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=520638794477144" },
  { rowIdx: 47, colDia: 10, produto: "Fichas e Resumos de Letras", diaNome: "DIA 5", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4299287350328499&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104104989446273" },
  { rowIdx: 48, colDia: 8, produto: "Projeto Marcenaria", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=633981863122900" },
  { rowIdx: 49, colDia: 8, produto: "Bijuteria", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=866928149845118" },
  { rowIdx: 50, colDia: 8, produto: "Alfabetização", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=292286153965893" },
  { rowIdx: 51, colDia: 8, produto: "Creme AntRugas (DROP)", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1030626216804522" },
  { rowIdx: 52, colDia: 8, produto: "Atividades Copa do mundo", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179" },
  { rowIdx: 53, colDia: 8, produto: "Calistenia asiática", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 54, colDia: 8, produto: "Religião LATAM", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=402138022974258" },
  { rowIdx: 55, colDia: 8, produto: "Dinamicas terapeuticas", diaNome: "DIA 3", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=519466767912828" },
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

      // Tentar ler o número de resultados
      const text = await page.evaluate(() => document.body.innerText);

      // Procurar por padrão "~X resultados" ou "X results" ou variações
      const matchPt = text.match(/~?([\d.,]+)\s*resultados?/i);
      const matchEn = text.match(/~?([\d.,]+)\s*results?/i);
      const match = matchPt || matchEn;

      let valor = 0;
      if (match) {
        const numStr = match[1].replace(/\./g, '').replace(/,/g, '');
        valor = parseInt(numStr, 10);
      }

      console.log(`${item.produto} (${item.diaNome}): ${valor}`);
      results.push({ ...item, valor });
    } catch (err) {
      console.log(`${item.produto} (${item.diaNome}): ERRO - ${err.message}`);
      results.push({ ...item, valor: 0, erro: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();

  console.log('\n=== RESULTADOS FINAIS ===');
  console.log(JSON.stringify(results, null, 2));
})();
