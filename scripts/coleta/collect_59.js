const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

async function fullCollect() {
  // Ler lista
  const output = execSync('node read_sheet.js 2>&1', { encoding: 'utf8' });
  const lines = output.split('\n');
  let jsonStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '[') {
      jsonStart = i;
      break;
    }
  }
  const jsonStr = lines.slice(jsonStart).join('\n');
  const produtos = JSON.parse(jsonStr);
  
  console.log(`\n📋 COLETANDO ${produtos.length} PRODUTOS`);
  console.log('━'.repeat(60));
  
  const browser = await chromium.launch({ headless: true });
  const resultados = [];
  let sucesso = 0;
  let erro = 0;
  
  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    const idx = String(i+1).padStart(2, '0');
    process.stdout.write(`[${idx}/${produtos.length}] ${p.produto.padEnd(35)} `);
    
    try {
      const page = await browser.newPage();
      await page.goto(p.link, { waitUntil: 'domcontentloaded', timeout: 12000 }).catch(() => {});
      await page.keyboard.press('Escape').catch(() => {});
      await page.waitForTimeout(600);
      
      const valor = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~?(\d+)\s*resultados?/i);
        if (match) return parseInt(match[1]);
        if (text.includes('Nenhum anúncio') || text.includes('No ads')) return 0;
        return 0;
      });
      
      resultados.push({ rowIdx: p.rowIdx, produto: p.produto, colDia: p.colDia, valor });
      console.log(`✅ ${valor}`);
      sucesso++;
      await page.close();
    } catch (e) {
      resultados.push({ rowIdx: p.rowIdx, produto: p.produto, colDia: p.colDia, valor: 0 });
      console.log(`⚠️ 0 (erro)`);
      erro++;
    }
  }
  
  await browser.close();
  
  fs.writeFileSync('coleta_59.json', JSON.stringify(resultados, null, 2));
  const total = resultados.reduce((s, r) => s + r.valor, 0);
  
  console.log('\n' + '━'.repeat(60));
  console.log(`✅ COLETA COMPLETA: ${sucesso}/${produtos.length} | Total: ${total} anúncios`);
}

fullCollect().catch(e => console.error('❌ Erro:', e.message));
