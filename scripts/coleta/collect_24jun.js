const { chromium } = require('playwright');
const fs = require('fs');

const produtos = [
  { rowIdx: 87, produto: "Exercícios para TDAH", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1539757124446179&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1032487749942829" },
  { rowIdx: 88, produto: "Molde Roupa PET", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2186336145475706&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=798961839967726" },
  { rowIdx: 89, produto: "Cristão + Hidroponica", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1157518119898256&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=764990176689674" },
  { rowIdx: 90, produto: "TCC com IA (R$ 297,00)", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1331009742267761&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103564767838055" },
  { rowIdx: 91, produto: "Catalogo Estética automotiva", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2036457113610000&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=931344583397575" },
  { rowIdx: 92, produto: "Atividades para idosos", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1672177637162368&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=118549594571851" },
  { rowIdx: 93, produto: "Atividades para copa", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=979861398247494&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=969531866239736" },
  { rowIdx: 94, produto: "Adesivo Sono", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1319715983491748&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=902865936254343" },
  { rowIdx: 95, produto: "Simulado CNH", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889272863572796&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=685480034656998" },
  { rowIdx: 96, produto: "Matemática Minecraft", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1466436528832369&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1025559857302305" },
  { rowIdx: 97, produto: "Desafio 21 dias Emagrec.", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=985099327616657&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=131485520040550" },
  { rowIdx: 98, produto: "Brinquedos de Papel", diaNome: "DIA 9", colDia: 14, link: "https://www.facebook.com/ads/library/?id=1321227846541377" },
  { rowIdx: 99, produto: "A história do lider (Política)", diaNome: "DIA 8", colDia: 13, link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27476307511973173&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=984175081437878" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const results = [];

  console.log(`\n🔍 Coletando ${produtos.length} produtos pendentes...\n`);

  for (let i = 0; i < produtos.length; i++) {
    const item = produtos[i];
    try {
      console.log(`[${i+1}/${produtos.length}] ${item.produto} (${item.diaNome})...`);

      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);

      try { await page.keyboard.press('Escape'); } catch (e) {}
      await page.waitForTimeout(1000);

      const valor = await page.evaluate(() => {
        const text = document.body.innerText || '';
        const match = text.match(/~?(\d+[\.,]?\d*)\s+resultados?/i);
        if (match) {
          return parseInt(match[1].replace(/[.,]/g, ''));
        }
        return 0;
      });

      results.push({
        rowIdx: item.rowIdx,
        sheetRow: item.rowIdx + 1,
        colDia: item.colDia,
        produto: item.produto,
        diaNome: item.diaNome,
        valor,
      });

      console.log(`  ✓ ${valor} anúncios`);
    } catch (error) {
      console.log(`  ✗ Erro: ${error.message.substring(0, 60)}`);
      results.push({
        rowIdx: item.rowIdx,
        sheetRow: item.rowIdx + 1,
        colDia: item.colDia,
        produto: item.produto,
        diaNome: item.diaNome,
        valor: 0,
        erro: true,
      });
    }
  }

  await browser.close();

  fs.writeFileSync('results_24jun.json', JSON.stringify(results, null, 2));

  const total = results.reduce((s, r) => s + r.valor, 0);
  const erros = results.filter(r => r.erro).length;

  console.log(`\n✅ Coleta concluída!`);
  console.log(`📊 Produtos: ${results.length} | Total anúncios: ${total} | Erros: ${erros}`);
  console.log(`📁 Salvo em: results_24jun.json`);
})();
