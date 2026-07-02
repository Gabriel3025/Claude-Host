const { chromium } = require('playwright');
const fs = require('fs');

// Produtos que precisam de DIA 9 (baseado em read_sheet.js)
const produtos = [
  { rowIdx: 1, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 8, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { rowIdx: 20, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 30, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 32, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 33, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 34, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 35, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=sonorizacaoinicial.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 38, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=103169518449662&search_type=page&media_type=all" },
  { rowIdx: 39, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=107858914644340&search_type=page&media_type=all" },
  { rowIdx: 40, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=178646532380534&search_type=page&media_type=all" },
  { rowIdx: 41, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 42, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=1666283893526589&search_type=page&media_type=all" },
  { rowIdx: 43, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=1666283893526589&search_type=page&media_type=all" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  console.log(`\n🔍 Coletando ${produtos.length} produtos para DIA 9...\n`);

  for (let i = 0; i < produtos.length; i++) {
    const item = produtos[i];
    try {
      console.log(`[${i+1}/${produtos.length}] ${item.produto}...`);
      
      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(1500);

      try {
        await page.keyboard.press('Escape');
      } catch (e) {}

      // Extrair número de resultados usando JavaScript puro
      const valor = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~?(\d+)\s+resultados?/i);
        return match ? parseInt(match[1]) : 0;
      });

      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        colDia: 14,
        valor: valor,
        dia: 9,
        sheetRow: item.rowIdx + 1
      });

      console.log(`  ✓ ${valor} anúncios`);
    } catch (error) {
      console.log(`  ✗ Erro: ${error.message}`);
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

  fs.writeFileSync('dia9_results.json', JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Coleta concluída!`);
  console.log(`📊 Total: ${results.length} produtos`);
  console.log(`📁 Resultados salvos em: dia9_results.json`);
})();
