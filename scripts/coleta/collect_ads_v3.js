const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

// Passo 1: Executar read_sheet.js e salvar em arquivo temporário
console.log('1️⃣ Lendo lista de produtos pendentes...');

// Executar read_sheet.js e capturar apenas stdout
const tempFile = path.join(__dirname, 'temp_sheet_output.txt');
const result = execSync(`node read_sheet.js 2>nul`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
fs.writeFileSync(tempFile, result);

// Ler arquivo e extrair JSON
const fileContent = fs.readFileSync(tempFile, 'utf-8');

// Encontrar posição do primeiro [ e último ]
let startIdx = fileContent.indexOf('[');
let endIdx = fileContent.lastIndexOf(']');

if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
  console.error('❌ Não foi possível extrair JSON do arquivo');
  console.error('Tentando alternativa...');

  // Alternativa: buscar linha por linha
  const lines = fileContent.split('\n');
  const jsonLines = [];
  let inJson = false;

  for (const line of lines) {
    if (line.trim() === '[') inJson = true;
    if (inJson) jsonLines.push(line);
    if (line.trim() === ']') {
      inJson = false;
      break;
    }
  }

  if (jsonLines.length === 0) {
    console.error('❌ Não conseguiu extrair JSON');
    process.exit(1);
  }

  const jsonStr = jsonLines.join('\n');
  var allData = JSON.parse(jsonStr);
} else {
  const jsonStr = fileContent.substring(startIdx, endIdx + 1);
  var allData = JSON.parse(jsonStr);
}

const pendentes = allData.filter(p => p.precisaPreenchimento === true && p.diaNome === 'DIA 7');
console.log(`✅ ${pendentes.length} produtos encontrados em DIA 7\n`);

// Limpar arquivo temporário
fs.unlinkSync(tempFile);

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
          // Pode falhar, continuar
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
  console.error(e);
  process.exit(1);
});
