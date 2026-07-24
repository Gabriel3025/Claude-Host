const { chromium } = require('playwright');
const fs = require('fs');

const produtos = JSON.parse(fs.readFileSync('scratch_pendentes_dia2_23_07.json', 'utf8'));

const REGEX_COM_ANUNCIOS = /~\s*(\d[\d.,]*)\s*resultados?/i;
const REGEX_ZERO = /Nenhum anúncio corresponde aos seus critérios de pesquisa/i;

async function coletar(page, produto) {
  await page.goto(produto.link, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2800);
  try {
    await page.keyboard.press('Escape');
  } catch (e) {}
  await page.waitForTimeout(600);
  const texto = await page.evaluate(() => document.body.innerText);

  const matchCom = texto.match(REGEX_COM_ANUNCIOS);
  if (matchCom) {
    return { ...produto, valor: parseInt(matchCom[1].replace(/[.,]/g, ''), 10), status: 'ok' };
  }
  if (REGEX_ZERO.test(texto)) {
    return { ...produto, valor: 0, status: 'ok_zero' };
  }
  return { ...produto, valor: null, status: 'falha' };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultados = [];
  for (const produto of produtos) {
    try {
      const r = await coletar(page, produto);
      resultados.push(r);
      console.log(`${r.status === 'falha' ? '❌' : '✅'} [${r.rowIdx}] ${r.produto} = ${r.valor}`);
    } catch (err) {
      resultados.push({ ...produto, valor: null, status: 'erro', erro: err.message });
      console.log(`❌ [${produto.rowIdx}] ${produto.produto} ERRO: ${err.message}`);
    }
  }

  await browser.close();
  fs.writeFileSync('scratch_resultados_dia2_23_07.json', JSON.stringify(resultados, null, 2));

  const falhas = resultados.filter(r => r.status === 'falha' || r.status === 'erro');
  console.log(`\nTotal: ${resultados.length} | Falhas: ${falhas.length}`);
}

main();
