const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

// Passo 1: Executar read_sheet.js e extrair JSON de forma robusta
console.log('1️⃣ Lendo lista de produtos pendentes...');

try {
  // Executar e capturar output (inclui stderr, mas vamos filtrar)
  const output = execSync('node read_sheet.js', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']  // Capturar stdout e stderr separadamente
  });

  // Buscar linha que começa com [ (início do JSON)
  const lines = output.split('\n');
  let jsonStartIdx = -1;
  let jsonEndIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('[') && jsonStartIdx === -1) {
      jsonStartIdx = i;
    }
    if (lines[i].trim() === ']' && jsonStartIdx !== -1) {
      jsonEndIdx = i;
      break;
    }
  }

  if (jsonStartIdx === -1) {
    console.error('❌ Não conseguiu encontrar JSON');
    // Salvar output para debug
    fs.writeFileSync('debug_output.txt', output);
    console.error('Output salvo em debug_output.txt');
    process.exit(1);
  }

  const jsonLines = lines.slice(jsonStartIdx, jsonEndIdx + 1);
  const jsonStr = jsonLines.join('\n');

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

          try {
            await page.press('Escape');
            await page.waitForTimeout(500);
          } catch (e) {
            // Pode falhar, continuar
          }

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
          console.log(`  ⚠️ 0`);
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

  // Executar coleta
  coletarDados().then(resultados => {
    console.log('\n✅ COLETA CONCLUÍDA');
    console.log('='.repeat(60));

    const totalAnuncios = resultados.reduce((sum, r) => sum + r.valor, 0);
    console.log(`Total de produtos: ${resultados.length}`);
    console.log(`Total de anúncios: ${totalAnuncios}`);

    fs.writeFileSync(
      path.join(__dirname, 'resultados_dia7.json'),
      JSON.stringify(resultados, null, 2)
    );

    console.log('\n📁 Resultados salvos em: resultados_dia7.json');
    console.log('='.repeat(60) + '\n');
    console.log('📝 PRÓXIMO PASSO: node write_dia7_correto.js\n');

    process.exit(0);
  }).catch(e => {
    console.error('\n❌ Erro na coleta:', e.message);
    process.exit(1);
  });

} catch (e) {
  console.error('❌ Erro:', e.message);
  process.exit(1);
}
