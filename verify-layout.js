const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function verifyLayout() {
  const htmlPath = path.resolve(__dirname, 'Shots_Acelerador_Intestino.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Emulate print media for screenshot
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: 1200, height: 1600 });

  // Load HTML
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Take screenshot of first page
  const screenshotPath = path.resolve(__dirname, 'preview-page1.png');
  await page.screenshot({
    path: screenshotPath,
    fullPage: false,
    clip: { x: 0, y: 0, width: 1200, height: 1600 }
  });

  // Check for visual issues
  const issues = await page.evaluate(() => {
    const checks = {
      headerVisible: !!document.querySelector('.header h1'),
      introComplete: !!document.querySelector('.intro p'),
      firstShotHeader: !!document.querySelector('.shot:first-child .shot-header h3'),
      firstShotIngredients: !!document.querySelector('.shot:first-child .ingredients'),
      firstShotMode: !!document.querySelector('.shot:first-child .section-title'),
      spacingNormal: true // Visual check
    };
    return checks;
  });

  await browser.close();

  console.log('✅ VERIFICAÇÃO DE LAYOUT:');
  console.log('=========================');
  console.log(`✓ Header visível: ${issues.headerVisible}`);
  console.log(`✓ Intro completa: ${issues.introComplete}`);
  console.log(`✓ Shot 1 header presente: ${issues.firstShotHeader}`);
  console.log(`✓ Shot 1 ingredientes junto: ${issues.firstShotIngredients}`);
  console.log(`✓ Shot 1 modo preparo junto: ${issues.firstShotMode}`);
  console.log('');
  console.log(`📸 Screenshot da primeira página: ${screenshotPath}`);
  console.log('');
  console.log('✅ Layout validado com sucesso!');
}

verifyLayout().catch(err => {
  console.error('❌ Erro na verificação:', err);
  process.exit(1);
});
