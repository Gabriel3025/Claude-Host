const { chromium } = require('playwright');
const fs = require('fs');

const produtos = [
  { rowIdx: 1, produto: "Tarot" },
  { rowIdx: 8, produto: "Como plantar" },
  { rowIdx: 12, produto: "Neuropro" },
];

(async () => {
  const browser = await chromium.launch({ headless: false }); // ABRIR NAVEGADOR VISÍVEL
  const page = await browser.newPage();
  
  const results = [];

  for (const item of produtos) {
    const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(item.produto)}&search_type=keyword_unordered`;
    
    console.log(`\n🔍 ${item.produto}`);
    console.log(`Link: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // Capturar screenshot para você validar
    const screenshotPath = `screenshot_${item.produto.replace(/\s+/g, '_')}.png`;
    await page.screenshot({ path: screenshotPath });
    console.log(`📸 Screenshot: ${screenshotPath}`);

    // Tentar extrair
    const texto = await page.innerText('body');
    const match = texto.match(/~?(\d+)\s+resultados?/i);
    const valor = match ? parseInt(match[1]) : 0;

    console.log(`Valor extraído: ${valor}`);
    console.log(`Parece realista? (você vai verificar no screenshot)`);

    results.push({
      rowIdx: item.rowIdx,
      produto: item.produto,
      valor: valor,
      screenshot: screenshotPath
    });
  }

  await browser.close();
  fs.writeFileSync('validation_results.json', JSON.stringify(results, null, 2));
})();
