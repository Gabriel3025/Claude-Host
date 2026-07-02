const { chromium } = require('playwright');
const fs = require('fs');

// Todos os 44 produtos com DIA 9 pendente
const produtos = [
  { rowIdx: 1, produto: "Tarot" },
  { rowIdx: 8, produto: "Como plantar" },
  { rowIdx: 12, produto: "Neuropro" },
  { rowIdx: 20, produto: "Airfryer" },
  { rowIdx: 30, produto: "Saude (Euro)" },
  { rowIdx: 32, produto: "Emagrecimento" },
  { rowIdx: 33, produto: "Atividade cursiva" },
  { rowIdx: 34, produto: "Jiujistu" },
  { rowIdx: 35, produto: "Alfabetização" },
  { rowIdx: 36, produto: "Pacotes de músicas" },
  { rowIdx: 38, produto: "100 Brincadeiras Bebês" },
  { rowIdx: 39, produto: "Organização do Lar" },
  { rowIdx: 40, produto: "DryWall" },
  { rowIdx: 41, produto: "100 Cards Anti-Bullying" },
  { rowIdx: 42, produto: "Planilha Capivarinha" },
  { rowIdx: 43, produto: "JiuJistsu (LATAM)" },
  { rowIdx: 52, produto: "Atividades Copa do mundo" },
  { rowIdx: 53, produto: "Calistenia asiática" },
  { rowIdx: 56, produto: "Hora da Leiturinha" },
  { rowIdx: 58, produto: "Cafajeste (Acompanhar OF)" },
  { rowIdx: 60, produto: "Painel Campeões" },
  { rowIdx: 61, produto: "Dinamicas aulas de PTBR" },
  { rowIdx: 62, produto: "Planilha financeira" },
  { rowIdx: 63, produto: "Atividades da Pro" },
  { rowIdx: 64, produto: "Calistenia asiática 2" },
  { rowIdx: 65, produto: "Atividades de português" },
  { rowIdx: 66, produto: "Atividades em segundos" },
  { rowIdx: 67, produto: "Figurinhaa do filho" },
  { rowIdx: 68, produto: "Potinho da fé" },
  { rowIdx: 69, produto: "Alfabetização" },
  { rowIdx: 70, produto: "ABA no Autismo" },
  { rowIdx: 71, produto: "KIT de costura (Acomapnhar)" },
  { rowIdx: 72, produto: "Baralho do coração aberto" },
  { rowIdx: 73, produto: "Jogo da Memória da Copa" },
  { rowIdx: 74, produto: "Colorir Copa do Mundo" },
  { rowIdx: 75, produto: "Artes para Terraplanagem" },
  { rowIdx: 76, produto: "Logo" },
  { rowIdx: 77, produto: "TDAH" },
  { rowIdx: 78, produto: "Segredo do bebe" },
  { rowIdx: 79, produto: "80 recursos terapeuticos" },
  { rowIdx: 80, produto: "Acelerar aprendizado da cria" },
  { rowIdx: 81, produto: "Quadro com versículos" },
  { rowIdx: 82, produto: "Bolsas Croche" },
  { rowIdx: 83, produto: "Hora de aprender cristão" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);
  
  const results = [];

  console.log(`\n🔍 Coletando ${produtos.length} produtos para DIA 9 (MODO ROBUSTO)...\n`);

  for (let i = 0; i < produtos.length; i++) {
    const item = produtos[i];
    try {
      console.log(`[${i+1}/${produtos.length}] ${item.produto}...`);
      
      // Usar busca genérica da biblioteca de anúncios
      const searchUrl = `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&q=${encodeURIComponent(item.produto)}&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc`;
      
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);

      try {
        await page.keyboard.press('Escape');
      } catch (e) {}

      const valor = await page.evaluate(() => {
        const text = document.body.innerText || '';
        const match = text.match(/~?(\d+)\s+resultados?/i);
        return match ? parseInt(match[1]) : 0;
      });

      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        colDia: 14,
        valor: valor,
        dia: 9,
        sheetRow: item.rowIdx + 1
      });

      console.log(`  ✓ ${valor} anúncios`);
    } catch (error) {
      console.log(`  ✗ ${item.produto}: ${error.message.substring(0, 50)}`);
      results.push({
        rowIdx: item.rowIdx,
        produto: item.produto,
        colDia: 14,
        valor: 0,
        dia: 9,
        sheetRow: item.rowIdx + 1,
        erro: true
      });
    }
  }

  await browser.close();

  fs.writeFileSync('dia9_results_complete.json', JSON.stringify(results, null, 2));
  
  console.log(`\n✅ Coleta COMPLETA concluída!`);
  console.log(`📊 Total: ${results.length} produtos coletados`);
  console.log(`📁 Resultados salvos em: dia9_results_complete.json`);
  console.log(`\n📈 Análise rápida:`);
  const total = results.reduce((sum, r) => sum + r.valor, 0);
  const comErro = results.filter(r => r.erro).length;
  console.log(`  - Total anúncios: ${total}`);
  console.log(`  - Produtos com erro: ${comErro}`);
})();
