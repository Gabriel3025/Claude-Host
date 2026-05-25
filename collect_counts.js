const { chromium } = require('playwright');

const dados = [
  { rowIdx: 1, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 8, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 20, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 21, produto: "200 dinamicas cristã", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027" }
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  for (let i = 0; i < dados.length; i++) {
    const item = dados[i];
    console.log(`[${i + 1}/${dados.length}] ${item.produto}...`);
    try {
      await page.goto(item.link, { waitUntil: 'networkidle', timeout: 30000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      const texto = await page.evaluate(() => document.body.innerText);
      const match = texto.match(/~?(\d+)\s+resultados?/i);
      const valor = match ? parseInt(match[1]) : 0;
      console.log(`  ✓ ${valor}`);
    } catch (err) {
      console.log(`  ⚠ ${err.message}`);
    }
  }

  await browser.close();
})();
