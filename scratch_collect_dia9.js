const { chromium } = require('playwright');
const fs = require('fs');

const SCRATCH = 'C:\\Users\\ADMINI~1.LAU\\AppData\\Local\\Temp\\claude\\c--Users-Administrador-LAURAFERREIRA-Downloads-Claude--Host-\\299bb5ae-452b-4f6e-9ec0-8ef547a3ab42\\scratchpad\\';
const produtos = JSON.parse(fs.readFileSync(SCRATCH + 'scratch_produtos.json', 'utf8'));

const REGEX_COM_ANUNCIOS = /~\s*(\d[\d.,]*)\s*resultados?/i;
const REGEX_ZERO = /Nenhum anúncio corresponde aos seus critérios de pesquisa/i;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultados = [];
  const falhas = [];

  for (const p of produtos) {
    try {
      await page.goto(p.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2800);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);

      let valor = null;
      const matchNum = text.match(REGEX_COM_ANUNCIOS);
      if (matchNum) {
        valor = parseInt(matchNum[1].replace(/[.,]/g, ''), 10);
      } else if (REGEX_ZERO.test(text)) {
        valor = 0;
      }

      if (valor === null) {
        falhas.push({ ...p, textSnippet: text.slice(0, 500) });
        console.log(`[FALHA] ${p.produto} (rowIdx ${p.rowIdx})`);
      } else {
        resultados.push({ rowIdx: p.rowIdx, colDia: p.colDia, produto: p.produto, valor });
        console.log(`[OK] ${p.produto} (rowIdx ${p.rowIdx}) -> ${valor}`);
      }
    } catch (e) {
      falhas.push({ ...p, error: e.message });
      console.log(`[ERRO] ${p.produto} (rowIdx ${p.rowIdx}): ${e.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync(SCRATCH + 'scratch_resultados_dia9.json', JSON.stringify(resultados, null, 2));
  fs.writeFileSync(SCRATCH + 'scratch_falhas_dia9.json', JSON.stringify(falhas, null, 2));

  console.log(`\n=== RESUMO ===`);
  console.log(`OK: ${resultados.length}`);
  console.log(`FALHAS: ${falhas.length}`);
})();
