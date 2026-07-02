const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

async function collectAll60() {
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
  
  console.log(`\n🚀 COLETANDO ${produtos.length} PRODUTOS COM MÉTODO ORIGINAL\n`);
  
  const browser = await chromium.launch({ headless: true });
  const resultados = [];
  
  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    const idx = String(i+1).padStart(2);
    process.stdout.write(`[${idx}/${produtos.length}] ${p.produto.padEnd(40)} `);
    
    try {
      const page = await browser.newPage();
      
      // Exatamente como no script original
      await page.goto(p.link, { waitUntil: 'networkidle', timeout: 30000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
      
      const result = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~(\d+)\s+resultados/);
        if (match) return match[1];
        if (text.includes('Nenhum anúncio')) return '0';
        return null;
      });
      
      const valor = result !== null ? parseInt(result) : 0;
      console.log(`✅ ${valor}`);
      resultados.push({ rowIdx: p.rowIdx, produto: p.produto, colDia: p.colDia, valor });
      
      await page.close();
    } catch (e) {
      console.log(`⚠️ 0`);
      resultados.push({ rowIdx: p.rowIdx, produto: p.produto, colDia: p.colDia, valor: 0 });
    }
  }
  
  await browser.close();
  
  fs.writeFileSync('coleta_60_metodo_original.json', JSON.stringify(resultados, null, 2));
  
  const total = resultados.reduce((s, r) => s + r.valor, 0);
  console.log(`\n✅ CONCLUÍDO: Total = ${total} anúncios`);
  console.log(`   Arquivo: coleta_60_metodo_original.json`);
}

collectAll60().catch(e => console.error('❌ Erro:', e.message));
