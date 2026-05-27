const { chromium } = require('playwright');
const fs = require('fs');

const products = [
  { rowIdx: 1, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 8, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 20, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 21, produto: "200 dinamicas cristã", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027" },
  { rowIdx: 24, produto: "Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 26, produto: "Ebook bibílico (Infant)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 27, produto: "Ficha de Treino", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 28, produto: "1.200 Moldes de Papel", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848" },
  { rowIdx: 29, produto: "Exerc. Anatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" }
];

(async () => {
  const browser = await chromium.launch({ headless: false }); // Visível!
  const page = await browser.newPage();
  const results = [];

  console.log('🌐 Abrindo navegador visível...\n');
  console.log('Navegando pelos produtos:\n');

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    console.log(`[${i+1}/${products.length}] ${prod.produto}`);
    
    try {
      await page.goto(prod.link, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      
      // Fechar popup se existir
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1500);

      const count = await page.evaluate(() => {
        const text = document.body.innerText;
        const match = text.match(/~?(\d+)\s*resultados?/i);
        return match ? parseInt(match[1]) : 0;
      });

      results.push({ rowIdx: prod.rowIdx, count });
      console.log(`   → ${count} anúncios\n`);

    } catch (err) {
      results.push({ rowIdx: prod.rowIdx, count: 0 });
      console.log(`   → Erro ao acessar\n`);
    }
  }

  fs.writeFileSync('collected_data.json', JSON.stringify(results, null, 2));
  console.log('✅ Coleta concluída! Dados salvos em collected_data.json');
  
  await browser.close();
})();
