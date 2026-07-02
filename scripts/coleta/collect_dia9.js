const { chromium } = require('playwright');

const produtos = [
  { rowIdx: 0, produto: "Tarot", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Tarot" },
  { rowIdx: 7, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Como+plantar" },
  { rowIdx: 11, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Neuropro" },
  { rowIdx: 19, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Airfryer" },
  { rowIdx: 29, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Saude" },
  { rowIdx: 31, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Emagrecimento" },
  { rowIdx: 32, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Atividade+cursiva" },
  { rowIdx: 33, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Jiujistu" },
  { rowIdx: 34, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Alfabetização" },
  { rowIdx: 35, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Pacotes" },
  { rowIdx: 37, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=100+Brincadeiras" },
  { rowIdx: 38, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Organização+Lar" },
  { rowIdx: 39, produto: "DryWall", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=DryWall" },
  { rowIdx: 40, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=100+Cards" },
  { rowIdx: 41, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=Capivarinha" },
  { rowIdx: 42, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_cached&media_type=all&view_all_page_id=&q=JiuJistsu" },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  for (const item of produtos) {
    try {
      await page.goto(item.link, { timeout: 30000 });
      await page.waitForTimeout(2000);
      
      // Tentar escape para fechar popups
      await page.press('Escape');
      await page.waitForTimeout(500);

      // Extract ~X resultados
      const text = await page.content();
      const match = text.match(/~(\d+)\s+resultados/);
      const valor = match ? parseInt(match[1]) : 0;

      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        colDia: 14, // Coluna O (1-based)
        valor: valor,
        dia: 9
      });

      console.log(`✓ ${item.produto}: ${valor} anúncios`);
    } catch (error) {
      console.log(`✗ ${item.produto}: Erro - ${error.message}`);
      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        colDia: 14,
        valor: 0,
        dia: 9,
        erro: true
      });
    }
  }

  await browser.close();

  // Salvar resultados em JSON
  const fs = require('fs');
  fs.writeFileSync('dia9_results.json', JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Coleta completa! ${results.length} produtos coletados.`);
  console.log('Resultados salvos em dia9_results.json');
})();
