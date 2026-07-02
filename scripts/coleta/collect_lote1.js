const { chromium } = require('playwright');
const fs = require('fs');

async function collectLote() {
  const links = [
    { rowIdx: 1, produto: 'Tarot', link: 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=332302629966050' },
    { rowIdx: 8, produto: 'Como plantar', link: 'https://www.facebook.com/ads/library/?active_status=active&q=agroescola.blog.br&search_type=keyword_unordered' },
    { rowIdx: 12, produto: 'Neuropro', link: 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=137915816063469' },
    { rowIdx: 20, produto: 'Airfryer', link: 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=568879309640604' },
    { rowIdx: 30, produto: 'Saude (Euro)', link: 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=985969307931107' },
    { rowIdx: 32, produto: 'Emagrecimento', link: 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=370127649521306' }
  ];

  console.log(`LOTE 1: ${links.length} produtos com timeouts ajustados`);
  const browser = await chromium.launch({ headless: true });
  const resultados = [];
  
  for (const item of links) {
    process.stdout.write(`${item.produto.padEnd(25)} `);
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(45000);
      page.setDefaultTimeout(45000);
      
      await page.goto(item.link, { waitUntil: 'networkidle', timeout: 40000 });
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1500);
      
      const valor = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~?(\d+)\s*resultados?/i);
        return match ? parseInt(match[1]) : 0;
      });
      
      console.log(`✅ ${valor}`);
      resultados.push({ rowIdx: item.rowIdx, produto: item.produto, valor });
      await page.close();
    } catch (e) {
      console.log(`❌ erro`);
      resultados.push({ rowIdx: item.rowIdx, produto: item.produto, valor: 0 });
    }
  }
  
  await browser.close();
  fs.writeFileSync('lote1.json', JSON.stringify(resultados, null, 2));
  console.log(`\nResultados salvos em lote1.json`);
}

collectLote();
