const { chromium } = require('playwright');

async function debugTarot() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 DEBUGANDO LINK TAROT...\n');
  
  const link = 'https://www.facebook.com/ads/library/?active_status=active&view_all_page_id=332302629966050';
  
  await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 40000 }).catch(e => {
    console.log('⚠️ Navegação com erro (comum no Facebook):', e.message);
  });
  
  await page.waitForTimeout(3000);
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(2000);
  
  const text = await page.evaluate(() => document.body.innerText);
  
  console.log('📄 PRIMEIROS 2000 CARACTERES DA PÁGINA:\n');
  console.log(text.substring(0, 2000));
  console.log('\n...\n');
  
  console.log('🔎 PROCURANDO PADRÕES:\n');
  const patterns = [
    { name: '~X resultados', regex: /~?(\d+)\s*resultados?/i },
    { name: 'Nenhum anúncio', regex: /nenhum\s+anúncio/i },
    { name: 'No ads', regex: /no\s+ads/i },
    { name: 'ads found', regex: /(\d+)\s+ads?\s+found/i }
  ];
  
  for (const p of patterns) {
    const match = text.match(p.regex);
    if (match) {
      console.log(`✅ ${p.name}: encontrado - "${match[0]}"`);
    }
  }
  
  // Procurar por qualquer número grande
  const numbers = text.match(/\d{2,}/g);
  if (numbers && numbers.length > 0) {
    console.log(`\n📊 Números encontrados: ${numbers.slice(0, 10).join(', ')}`);
  }
  
  await browser.close();
}

debugTarot().catch(e => console.error('❌ Erro:', e.message));
