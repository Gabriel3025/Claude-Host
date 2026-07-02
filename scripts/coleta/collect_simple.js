#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

async function main() {
  // Passo 1: Executar read_sheet.js e extrair JSON
  console.log('1️⃣ Lendo dados via read_sheet.js...');

  try {
  // Executar read_sheet.js capturando apenas stdout
  const output = execSync('node read_sheet.js 2>&1', {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  });

  // Extrair JSON da saída (busca pela última ocorrência de [ e ])
  let jsonStr = null;
  let startIdx = output.lastIndexOf('[');
  let endIdx = output.lastIndexOf(']');

  if (startIdx >= 0 && endIdx > startIdx) {
    jsonStr = output.substring(startIdx, endIdx + 1);
  }

  if (!jsonStr) {
    // Fallback: buscar linha por linha
    const lines = output.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim() === '}' || lines[i].trim() === ']') {
        // Encontrar o início
        for (let j = i; j >= 0; j--) {
          if (lines[j].trim().startsWith('[')) {
            jsonStr = lines.slice(j, i + 1).join('\n');
            break;
          }
        }
        if (jsonStr) break;
      }
    }
  }

  if (!jsonStr) {
    throw new Error('Não conseguiu extrair JSON');
  }

  const allData = JSON.parse(jsonStr);
  const pendentes = allData.filter(p => p.precisaPreenchimento === true && p.diaNome === 'DIA 7');

  console.log(`✅ ${pendentes.length} produtos encontrados\n`);

  if (pendentes.length === 0) {
    console.log('⏭️  Nenhum produto para processar');
    process.exit(0);
  }

  // Passo 2: Coletar dados via Playwright
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
          // Ok falhar
        }

        const valor = await page.evaluate(() => {
          const text = document.body.innerText;
          const match = text.match(/~(\d+)\s+(?:resultados|result)/i);
          return match ? parseInt(match[1]) : 0;
        });

        resultados.push({
          rowIdx: produto.rowIdx,
          sheetRow: produto.rowIdx + 1,
          colDia: produto.colDia,
          produto: produto.produto,
          valor: valor
        });

        console.log(`  ✅ ${valor}`);
      } catch (e) {
        console.log(`  ⚠️ 0`);
        resultados.push({
          rowIdx: produto.rowIdx,
          sheetRow: produto.rowIdx + 1,
          colDia: produto.colDia,
          produto: produto.produto,
          valor: 0
        });
      }
    }

    await browser.close();

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

  } catch (e) {
    if (browser) await browser.close();
    console.error('\n❌ Erro na coleta:', e.message);
    process.exit(1);
  }

  } catch (e) {
    console.error('\n❌ Erro:', e.message);
    process.exit(1);
  }
}

main();
