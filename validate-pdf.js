const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function validatePDFBreaks() {
  const htmlPath = path.resolve(__dirname, 'Shots_Acelerador_Intestino.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Emulate print media
  await page.emulateMedia({ media: 'print' });
  await page.setViewportSize({ width: 1200, height: 1600 });

  // Load HTML
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Get page metrics
  const metrics = await page.evaluate(() => {
    const container = document.querySelector('.container');
    const header = document.querySelector('.header');
    const intro = document.querySelector('.intro');
    const shots = document.querySelectorAll('.shot');
    const protocol = document.querySelector('.protocol');
    const footer = document.querySelector('.footer');

    return {
      containerHeight: container?.scrollHeight || 0,
      headerHeight: header?.offsetHeight || 0,
      introHeight: intro?.offsetHeight || 0,
      shotsCount: shots.length,
      shotsHeights: Array.from(shots).map((s, i) => ({
        shotNumber: i + 1,
        height: s.offsetHeight
      })),
      protocolHeight: protocol?.offsetHeight || 0,
      footerHeight: footer?.offsetHeight || 0
    };
  });

  await browser.close();

  console.log('📊 ANÁLISE DE QUEBRAS DE PÁGINA:');
  console.log('================================');
  console.log(`📄 Altura total do container: ${metrics.containerHeight}px`);
  console.log(`   (A4 em print ≈ 950px por página)`);
  console.log('');
  console.log(`📍 HEADER: ${metrics.headerHeight}px`);
  console.log(`📍 INTRO: ${metrics.introHeight}px`);
  console.log('');
  console.log('📍 SHOTS:');
  metrics.shotsHeights.forEach(shot => {
    console.log(`   Shot ${shot.shotNumber}: ${shot.height}px`);
  });
  console.log('');
  console.log(`📍 PROTOCOLO: ${metrics.protocolHeight}px`);
  console.log(`📍 FOOTER: ${metrics.footerHeight}px`);
  console.log('');
  console.log('📋 ESTIMATIVA DE PÁGINAS:');
  const p1 = metrics.headerHeight + metrics.introHeight;
  console.log(`   Página 1 (Header + Intro): ~${Math.ceil(p1 / 950)} página (${p1}px)`);
  metrics.shotsHeights.forEach((shot, i) => {
    console.log(`   Página ${i + 2} (Shot ${shot.shotNumber}): ~1 página (${shot.height}px)`);
  });
  console.log(`   Página ${metrics.shotsHeights.length + 2} (Protocolo + Footer): ~1 página (${metrics.protocolHeight + metrics.footerHeight}px)`);
  console.log('');
  console.log(`✅ Total esperado: ${metrics.shotsHeights.length + 2}-${metrics.shotsHeights.length + 3} páginas`);
}

validatePDFBreaks().catch(err => {
  console.error('❌ Erro na validação:', err);
  process.exit(1);
});
