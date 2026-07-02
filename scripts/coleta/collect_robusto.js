const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');

async function collectAll() {
  // Ler lista completa
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
  
  console.log(`\n🚀 INICIANDO COLETA ROBUSTA: ${produtos.length} PRODUTOS`);
  console.log('═'.repeat(70));
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--disable-blink-features=AutomationControlled']
  });
  
  const resultados = [];
  let sucesso = 0;
  
  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    const idx = String(i+1).padStart(2);
    process.stdout.write(`[${idx}/${produtos.length}] ${p.produto.padEnd(40)} `);
    
    let valor = 0;
    let tentativas = 0;
    
    while (tentativas < 2 && valor === 0) {
      try {
        const page = await browser.newPage();
        
        // Configurar timeouts longos
        page.setDefaultNavigationTimeout(60000);
        page.setDefaultTimeout(60000);
        
        // Navegar
        await page.goto(p.link, { 
          waitUntil: 'domcontentloaded',
          timeout: 55000 
        }).catch(() => {});
        
        // Aguardar carregamento
        await page.waitForTimeout(2500);
        
        // Pressionar Escape
        await page.keyboard.press('Escape').catch(() => {});
        await page.waitForTimeout(1500);
        
        // Scroll para ativar lazy loading
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        }).catch(() => {});
        
        await page.waitForTimeout(1000);
        
        // Tentar extrair valor
        valor = await page.evaluate(() => {
          const text = document.body.innerText;
          // Procurar padrão "~X resultados" ou "X resultados"
          const match = text.match(/~?(\d+)\s*resultados?/i);
          if (match) return parseInt(match[1]);
          // Verificar se há "Nenhum anúncio"
          if (text.includes('Nenhum anúncio') || text.includes('No ads') || 
              text.includes('nenhum anúncio')) return 0;
          return -1; // Indicar que não encontrou
        }).catch(() => -1);
        
        await page.close();
        
        if (valor === -1) valor = 0; // Se não encontrou, assume 0
        tentativas++;
        
      } catch (e) {
        tentativas++;
        valor = 0;
      }
    }
    
    if (valor >= 0) {
      console.log(`✅ ${valor}`);
      sucesso++;
    } else {
      console.log(`⚠️ 0 (não detectado)`);
      valor = 0;
    }
    
    resultados.push({ rowIdx: p.rowIdx, produto: p.produto, colDia: p.colDia, valor });
  }
  
  await browser.close();
  
  // Salvar resultados
  fs.writeFileSync('coleta_completa_robusto.json', JSON.stringify(resultados, null, 2));
  
  const total = resultados.reduce((s, r) => s + r.valor, 0);
  console.log('\n' + '═'.repeat(70));
  console.log(`✅ COLETA ROBUSTA COMPLETA:`);
  console.log(`   • ${sucesso}/${produtos.length} produtos processados`);
  console.log(`   • Total: ${total} anúncios`);
  console.log(`   • Arquivo: coleta_completa_robusto.json`);
}

collectAll().catch(e => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
