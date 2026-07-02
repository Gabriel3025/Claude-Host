#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 1\n');

  try {
    console.log('1️⃣ Lendo lista de produtos...');
    const tempFile = path.join(__dirname, 'temp_sheet_data.txt');
    execSync(`node read_sheet.js > "${tempFile}" 2>&1`);

    const fileContent = fs.readFileSync(tempFile, 'utf-8');
    const lines = fileContent.split('\n');

    let jsonStartLine = -1;
    let jsonEndLine = -1;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('[')) {
        jsonStartLine = i;
      }
      if (lines[i].trim() === ']') {
        jsonEndLine = i;
      }
    }

    const jsonLines = lines.slice(jsonStartLine, jsonEndLine + 1);
    const jsonStr = jsonLines.join('\n');
    const allData = JSON.parse(jsonStr);

    const pendentes = allData.filter(p => p.precisaPreenchimento === true && p.diaNome === 'DIA 1');

    console.log(`✅ ${pendentes.length} produtos encontrados\n`);

    if (pendentes.length === 0) {
      console.log('⏭️  Nenhum produto para processar');
      fs.unlinkSync(tempFile);
      process.exit(0);
    }

    const { chromium } = require('playwright');
    const resultados = [];
    let browser;

    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.newContext();
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
          } catch (e) {}

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

      fs.writeFileSync(path.join(__dirname, 'resultados_dia1.json'), JSON.stringify(resultados, null, 2));

      console.log('\n📁 Resultados salvos em: resultados_dia1.json');
      console.log('='.repeat(60) + '\n');

      fs.unlinkSync(tempFile);

    } catch (e) {
      if (browser) await browser.close();
      throw e;
    }

  } catch (e) {
    console.error('\n❌ Erro:', e.message);
    process.exit(1);
  }
}

main();
