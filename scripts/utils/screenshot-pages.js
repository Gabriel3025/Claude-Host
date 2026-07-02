const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const pdfPath = path.resolve('C:/Users/Administrador.LAURAFERREIRA/Desktop/Shots_Acelerador_Intestino.pdf');
  
  await page.goto(`file://${pdfPath}`, { waitUntil: 'networkidle' }).catch(() => {});
  
  // Renderizar HTML direto
  const htmlPath = path.resolve('Shots_Acelerador_Intestino.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  
  // Screenshot das seções em impressão
  await page.emulateMedia({ media: 'print' });
  
  // Página 1
  const page1 = await page.screenshot({ path: 'page-1-preview.png', fullPage: false });
  console.log('Capturada página 1 (preview)');
  
  // Scroll para Shot 1
  await page.evaluate(() => {
    const shots = document.querySelectorAll('.shot');
    if (shots[0]) {
      shots[0].scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  await page.waitForTimeout(500);
  const page2 = await page.screenshot({ path: 'page-2-shot1.png', fullPage: false });
  console.log('Capturada Shot 1');
  
  console.log('\nValidação visual:');
  console.log('- page-1-preview.png: Header + Intro');
  console.log('- page-2-shot1.png: Shot 1 (validar consolidação)');
  
  await browser.close();
})();
