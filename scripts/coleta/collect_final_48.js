const { chromium } = require('playwright');
const fs = require('fs');

// Load all products with links from JSON
const products = JSON.parse(fs.readFileSync('all_products_with_links.json', 'utf-8'));

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const results = [];
  const startIdx = 1; // Skip index 0 (header)

  console.log('\n🔍 COLETA FINAL - 67 PRODUTOS\n');
  console.log('='.repeat(70));

  for (let i = startIdx; i < products.length; i++) {
    const prod = products[i];
    const rowIdx = prod.rowIdx - 1; // Convert to 0-based row index for spreadsheet

    console.log(`\n[${i}/${products.length}] Row ${rowIdx}: ${prod.produto}`);
    console.log('-'.repeat(70));

    try {
      console.log('📍 Navegando...');
      await page.goto(prod.link, {
        waitUntil: 'networkidle',
        timeout: 25000
      }).catch(err => console.log('⚠️  Timeout', err.message));

      console.log('⏳ Aguardando carregamento dinâmico...');
      await page.waitForTimeout(3000);

      console.log('🚪 Fechando popups (Escape)...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);

      console.log('🔎 Extraindo número de anúncios...');
      let count = await page.evaluate(() => {
        const allText = document.body.innerText;

        // Tenta múltiplos padrões
        const patterns = [
          /~?(\d+)\s+resultados?/i,
          /(\d+)\s+resultados?/i,
          /~?(\d+)\s+results?/i,
          /(\d+)\s+results?/i,
        ];

        for (const pattern of patterns) {
          const match = allText.match(pattern);
          if (match) {
            return parseInt(match[1]);
          }
        }

        return null;
      });

      // Se não achou número, verifica se página está em branco
      if (count === null) {
        const isEmpty = await page.evaluate(() => {
          const ads = document.querySelectorAll('[role="article"], .ad-item, .advertisement');
          return ads.length === 0 && document.body.innerText.length < 100;
        });

        if (isEmpty) {
          count = 0;
          console.log('   ℹ️  Página em branco = 0 anúncios');
        }
      }

      // Fallback final
      if (count === null) {
        console.log('❌ Não consegui extrair. Verifique na tela e digite o número (ou enter para 0)');
        count = 0;
      }

      console.log(`✅ ${count} anúncios encontrados`);
      results.push({ rowIdx: rowIdx, produto: prod.produto, count });

    } catch (err) {
      console.error(`❌ Erro: ${err.message}`);
      results.push({ rowIdx: rowIdx, produto: prod.produto, count: 0 });
    }

    // Pausa entre produtos
    if (i < products.length - 1) {
      console.log('⏸️  Aguardando 1 segundo...');
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();

  // Salva resultados
  fs.writeFileSync('resultados_final.json', JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('✅ COLETA CONCLUÍDA!');
  console.log('='.repeat(70));
  console.log('\nResultados (prontos para gravar em DIA 3):');
  console.log(JSON.stringify(results, null, 2));
})();
