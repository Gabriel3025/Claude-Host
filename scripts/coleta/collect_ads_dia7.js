const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ler dados do read_sheet.js
const { execSync } = require('child_process');
let pendentes = [];

try {
  const output = execSync('node read_sheet.js', { encoding: 'utf-8' });
  // Extrair JSON array da saída
  const startIdx = output.lastIndexOf('[');
  const endIdx = output.lastIndexOf(']') + 1;
  if (startIdx !== -1 && endIdx > startIdx) {
    const jsonStr = output.substring(startIdx, endIdx);
    const allData = JSON.parse(jsonStr);
    pendentes = allData.filter(p => p.precisaPreenchimento === true && p.diaNome === 'DIA 7');
  }
} catch (e) {
  console.error('Erro ao ler pendentes:', e.message);
  process.exit(1);
}

console.log(`\n📊 ACOMPANHAMENTO DE OFERTAS - DIA 7`);
console.log(`Produtos pendentes: ${pendentes.length}`);
console.log('='.repeat(60));

// Função para coletar dados via Playwright
async function coletarDados() {
  const { chromium } = require('playwright');
  const resultados = [];
  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.createContext();
    const page = await context.newPage();

    // Configurar timeout
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    for (let i = 0; i < pendentes.length; i++) {
      const produto = pendentes[i];
      console.log(`\n[${i + 1}/${pendentes.length}] ${produto.produto}`);

      try {
        // Navegar para o link
        console.log('  → Navegando...');
        await page.goto(produto.link, { waitUntil: 'domcontentloaded', timeout: 30000 });

        // Aguardar carregamento mínimo
        await page.waitForTimeout(2000);

        // Pressionar Escape para fechar popup
        console.log('  → Fechando popup...');
        await page.press('Escape');
        await page.waitForTimeout(1000);

        // Extrair número de anúncios
        console.log('  → Extraindo dados...');
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
          sheetRow: produto.rowIdx + 1  // Validação: rowIdx 0-based → sheetRow 1-based
        });

        console.log(`  ✅ ${valor} anúncios`);
      } catch (e) {
        console.log(`  ⚠️ Erro: ${e.message} - registrando como 0`);
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
  console.log('\n' + '='.repeat(60));
  console.log('✅ COLETA CONCLUÍDA');
  console.log(`Total de produtos: ${resultados.length}`);
  console.log(`Total de anúncios: ${resultados.reduce((sum, r) => sum + r.valor, 0)}`);
  console.log('='.repeat(60));

  // Salvar resultados em arquivo JSON
  fs.writeFileSync(
    path.join(__dirname, 'resultados_dia7.json'),
    JSON.stringify(resultados, null, 2)
  );

  console.log('\n📁 Resultados salvos em: resultados_dia7.json\n');
  console.log('RESUMO:');
  resultados.forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.produto.padEnd(30)} → ${r.valor} anúncios (rowIdx: ${r.rowIdx}, sheetRow: ${r.sheetRow})`);
  });

  process.exit(0);
}).catch(e => {
  console.error('\n❌ Erro na coleta:', e.message);
  process.exit(1);
});
