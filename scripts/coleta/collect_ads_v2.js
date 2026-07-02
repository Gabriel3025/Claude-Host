const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

// Passo 1: Executar read_sheet.js e salvar saída
console.log('1️⃣ Lendo lista de produtos pendentes...');
const output = execSync('node read_sheet.js', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

// Extrair JSON da saída
const startIdx = output.lastIndexOf('[');
const endIdx = output.lastIndexOf(']') + 1;

if (startIdx === -1 || endIdx <= startIdx) {
  console.error('❌ Não foi possível extrair JSON');
  process.exit(1);
}

const jsonStr = output.substring(startIdx, endIdx);
const allData = JSON.parse(jsonStr);
const pendentes = allData.filter(p => p.precisaPreenchimento === true && p.diaNome === 'DIA 7');

console.log(`✅ ${pendentes.length} produtos encontrados em DIA 7\n`);

// Passo 2: Coletar dados via Playwright
async function coletarDados() {
  const { chromium } = require('playwright');
  const resultados = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.createContext();
    const page = await context.newPage();

    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    console.log('2️⃣ Coletando dados via Playwright...\n');

    for (let i = 0; i < pendentes.length; i++) {
      const produto = pendentes[i];
      const num = i + 1;
      process.stdout.write(`[${num}/${pendentes.length}] ${produto.produto.padEnd(35)}`);

      try {
        await page.goto(produto.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Fechar popup
        try {
          await page.press('Escape');
          await page.waitForTimeout(500);
        } catch (e) {
          // Escape pode falhar, continuar mesmo assim
        }

        // Extrair número
        const valor = await page.evaluate(() => {
          const text = document.body.innerText;
          const match = text.match(/~(\d+)\s+(?:resultados|result)/i);
          return match ? parseInt(match[1]) : 0;
        });

        resultados.push({
          rowIdx: produto.rowIdx,
          colDia: produto.colDia,
          produto: produto.produto,
          valor: valor,
          sheetRow: produto.rowIdx + 1
        });

        console.log(`  ✅ ${valor}`);
      } catch (e) {
        console.log(`  ⚠️ 0 (erro: ${e.message.substring(0, 20)})`);
        resultados.push({
          rowIdx: produto.rowIdx,
          colDia: produto.colDia,
          produto: produto.produto,
          valor: 0,
          sheetRow: produto.rowIdx + 1
        });
      }
    }

    await browser.close();
    return resultados;
  } catch (e) {
    if (browser) await browser.close();
    throw e;
  }
}

// Executar
coletarDados().then(resultados => {
  console.log('\n✅ COLETA CONCLUÍDA');
  console.log('='.repeat(60));

  const totalAnuncios = resultados.reduce((sum, r) => sum + r.valor, 0);
  console.log(`Total de produtos: ${resultados.length}`);
  console.log(`Total de anúncios: ${totalAnuncios}`);

  // Salvar resultados
  fs.writeFileSync(
    path.join(__dirname, 'resultados_dia7.json'),
    JSON.stringify(resultados, null, 2)
  );

  console.log('\n📁 Resultados salvos em: resultados_dia7.json');
  console.log('='.repeat(60) + '\n');
  console.log('📝 PRÓXIMO PASSO: node write_dia7_correto.js\n');

  process.exit(0);
}).catch(e => {
  console.error('\n❌ Erro:', e.message);
  process.exit(1);
});
