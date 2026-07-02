const { chromium } = require('playwright');
const fs = require('fs');

const produtos = require('./collected_values.json');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  const results = [];
  let successCount = 0;

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    try {
      console.log(`[${i+1}/${produtos.length}] ${p.produto}...`);

      await page.goto(p.link, { waitUntil: 'domcontentloaded', timeout: 12000 });
      await page.waitForTimeout(2000);

      // Tenta extrair o número via CSS selector
      const selectors = [
        'div[role="status"]',
        '[data-testid="ads_results_count"]',
        'span:has-text("resultados")',
      ];

      let valor = '0';
      for (const selector of selectors) {
        try {
          const el = await page.$(selector);
          if (el) {
            const text = await el.innerText();
            const match = text.match(/(\d+)/);
            if (match) {
              valor = match[1];
              break;
            }
          }
        } catch (e) {
          // ignore
        }
      }

      // Se ainda não encontrou, tenta pelo corpo da página
      if (valor === '0') {
        const bodyText = await page.innerText('body', { timeout: 2000 }).catch(() => '');
        const match = bodyText.match(/~?(\d+)\s*resultados?/i);
        if (match) {
          valor = match[1];
        }
      }

      results.push({
        rowIdx: p.rowIdx,
        produto: p.produto,
        valor: valor
      });

      console.log(`  ✓ ${valor}`);
      successCount++;

    } catch (err) {
      console.error(`  ✗ ${err.message.slice(0, 50)}`);
      results.push({
        rowIdx: p.rowIdx,
        produto: p.produto,
        valor: '0'
      });
    }
  }

  console.log(`\n✅ Coleta: ${successCount}/${produtos.length} com sucesso`);
  fs.writeFileSync('collected_values_final.json', JSON.stringify(results, null, 2));

  await browser.close();
})();
