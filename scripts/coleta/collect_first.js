const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const link = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all";

  try {
    console.log('Acessando: Atividade cursiva');
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    try {
      await page.press('Escape');
    } catch (e) {}
    
    await page.waitForTimeout(2000);
    
    const text = await page.locator('body').textContent();
    const match = text.match(/~?(\d+)\s*resultados?/i);
    const count = match ? parseInt(match[1]) : 0;
    
    console.log(`✓ Contagem: ${count} anúncios`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }

  await browser.close();
})();
