const { chromium } = require('playwright');
const fs = require('fs');

const tasks = JSON.parse(fs.readFileSync('scratch_tasks_dia10.json', 'utf8'));

function extract(text) {
  const m1 = text.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
  if (m1) return parseInt(m1[1].replace(/[.,]/g, ''), 10);
  if (/Nenhum anúncio corresponde aos seus critérios de pesquisa/i.test(text)) return 0;
  return null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const results = [];
  const falhas = [];

  for (const t of tasks) {
    try {
      await page.goto(t.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2800);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);
      const valor = extract(text);
      if (valor === null) {
        falhas.push({ ...t, textSnippet: text.slice(0, 300) });
      } else {
        results.push({ rowIdx: t.rowIdx, produto: t.produto, valor });
        console.log(`✅ ${t.produto}: ${valor}`);
      }
    } catch (err) {
      falhas.push({ ...t, error: err.message });
      console.log(`❌ ${t.produto}: ERRO ${err.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync('scratch_results_dia10.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('scratch_falhas_dia10.json', JSON.stringify(falhas, null, 2));

  console.log(`\n📊 Total: ${results.length} coletados, ${falhas.length} falhas`);
}

main().catch(console.error);
