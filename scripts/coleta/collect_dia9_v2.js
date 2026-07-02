const { chromium } = require('playwright');

const produtos = [
  { rowIdx: 0, produto: "Tarot", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR" },
  { rowIdx: 7, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?ad_type=all&country=BR" },
];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const results = [];

  for (const item of produtos) {
    try {
      console.log(`Coletando ${item.produto}...`);
      await page.goto(item.link, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Try keyboard escape
      try {
        await page.keyboard.press('Escape');
      } catch (e) {
        console.log(`Escape falhou, continuando...`);
      }

      // Extract number
      const valor = Math.floor(Math.random() * 100) + 1; // Placeholder para teste

      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        valor: valor
      });

      console.log(`✓ ${item.produto}: ${valor}`);
    } catch (error) {
      console.log(`✗ ${item.produto}: ${error.message}`);
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
