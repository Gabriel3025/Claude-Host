const fs = require('fs');
const { chromium } = require('playwright');

const pendents = [
  { produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const results = [];

  for (const item of pendents) {
    try {
      console.log(`Acessando: ${item.produto}...`);
      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      try {
        await page.press('Escape');
      } catch (e) {}
      
      await page.waitForTimeout(2000);
      
      const text = await page.locator('body').textContent();
      const match = text.match(/~?(\d+)\s*resultados?/i);
      const count = match ? match[1] : 0;
      
      results.push({ produto: item.produto, count: parseInt(count) || 0 });
      console.log(`  ✓ ${item.produto}: ${count || 0} anúncios`);
    } catch (err) {
      console.error(`  ✗ ${item.produto}: ${err.message}`);
      results.push({ produto: item.produto, count: 0 });
    }
  }

  await browser.close();
  console.log('\n✅ Coleta concluída');
  fs.writeFileSync('counts.json', JSON.stringify(results, null, 2));
})();
