const { chromium } = require('playwright');
const fs = require('fs');

const tasks = JSON.parse(fs.readFileSync('scratch_tasks_dia1.json', 'utf8'));

const RE_COM_ANUNCIOS = /~\s*(\d[\d.,]*)\s*resultados?/i;
const RE_ZERO = /Nenhum anúncio corresponde aos seus crit[ée]rios de pesquisa/i;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultados = [];
  const falhas = [];

  for (const t of tasks) {
    try {
      await page.goto(t.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2800);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);

      let valor = null;
      const m1 = text.match(RE_COM_ANUNCIOS);
      if (m1) {
        valor = parseInt(m1[1].replace(/[.,]/g, ''), 10);
      } else if (RE_ZERO.test(text)) {
        valor = 0;
      }

      if (valor === null) {
        falhas.push({ ...t, textDump: text.slice(0, 500) });
        console.log(`[FALHA] ${t.produto}`);
      } else {
        resultados.push({ rowIdx: t.rowIdx, colDia: t.colDia, produto: t.produto, valor });
        console.log(`[OK] ${t.produto} => ${valor}`);
      }
    } catch (e) {
      falhas.push({ ...t, error: e.message });
      console.log(`[ERRO] ${t.produto}: ${e.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync('scratch_resultados_dia1.json', JSON.stringify(resultados, null, 2));
  fs.writeFileSync('scratch_falhas_dia1.json', JSON.stringify(falhas, null, 2));

  console.log(`\nTotal OK: ${resultados.length} / ${tasks.length}`);
  console.log(`Total falhas: ${falhas.length}`);
}

main().catch(console.error);
