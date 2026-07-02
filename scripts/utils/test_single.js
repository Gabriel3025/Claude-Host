const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const url = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050";
  
  console.log("Acessando URL...");
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    console.log("✅ URL acessada");
    
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);
    console.log("✅ Escape pressionado");
    
    const texto = await page.evaluate(() => document.body.innerText);
    console.log("\nTexto da página (primeiras 1000 chars):");
    console.log(texto.substring(0, 1000));
    
    const match = texto.match(/~(\d+)\s+resultados/);
    console.log("\nMatch encontrado:", match);
    
  } catch (err) {
    console.error("Erro:", err.message);
  }
  
  await browser.close();
})();
