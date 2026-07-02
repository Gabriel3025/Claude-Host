const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');

async function getLinksFromReadSheet() {
  return new Promise((resolve) => {
    const node = spawn('node', ['read_sheet.js']);
    let output = '';
    
    node.stdout.on('data', (data) => output += data.toString());
    node.stderr.on('data', (data) => output += data.toString());
    
    node.on('close', () => {
      const lines = output.split('\n');
      const produtos = [];
      let currentObj = {};
      
      for (const line of lines) {
        if (line.includes('"rowIdx":')) {
          const match = line.match(/"rowIdx":\s*(\d+)/);
          if (match) currentObj.rowIdx = parseInt(match[1]);
        }
        if (line.includes('"diaNome": "DIA 9"')) {
          currentObj.isDia9 = true;
        }
        if (line.includes('"link":') && currentObj.isDia9) {
          const match = line.match(/"link":\s*"([^"]+)"/);
          if (match) {
            currentObj.link = match[1];
            if (currentObj.rowIdx !== undefined) {
              produtos.push({
                rowIdx: currentObj.rowIdx,
                link: currentObj.link
              });
              currentObj = {};
            }
          }
        }
      }
      
      resolve(produtos);
    });
  });
}

(async () => {
  console.log('Obtendo links corretos do read_sheet.js...\n');
  const produtos = await getLinksFromReadSheet();
  
  console.log(`Encontrados ${produtos.length} produtos com DIA 9\n`);
  
  if (produtos.length === 0) {
    console.log('ERRO: Nenhum produto encontrado!');
    process.exit(1);
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  
  const results = [];
  
  for (let i = 0; i < produtos.length; i++) {
    const item = produtos[i];
    try {
      console.log(`[${i+1}/${produtos.length}] rowIdx ${item.rowIdx}...`);
      
      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);
      
      try {
        await page.keyboard.press('Escape');
      } catch (e) {}
      
      const valor = await page.evaluate(() => {
        const bodyText = document.body.innerText || '';
        const match = bodyText.match(/~?(\d+)\s+resultados?/i);
        return match ? parseInt(match[1]) : 0;
      });
      
      results.push({
        rowIdx: item.rowIdx,
        valor: valor,
        sheetRow: item.rowIdx + 1
      });
      
      console.log(`  ✓ ${valor}`);
      
    } catch (error) {
      console.log(`  ✗ ${error.message.substring(0, 40)}`);
      results.push({
        rowIdx: item.rowIdx,
        valor: 0,
        erro: true
      });
    }
  }
  
  await browser.close();
  
  fs.writeFileSync('dia9_final_correto.json', JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Coleta concluída: ${results.length} produtos`);
  const total = results.reduce((sum, r) => sum + r.valor, 0);
  console.log(`Total: ${total} anúncios`);
})();
