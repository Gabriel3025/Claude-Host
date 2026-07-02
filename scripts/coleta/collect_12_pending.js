const { chromium } = require('playwright');

const pending = [
  { rowIdx: 38, produto: "Moldes EVA", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335" },
  { rowIdx: 39, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 40, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 41, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 42, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 43, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { rowIdx: 44, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { rowIdx: 45, produto: "Kit Casinhas de Boneca", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=894236146555718&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=889932910880439" },
  { rowIdx: 46, produto: "Kit Figurinhas Educativas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1286271340269388&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=520638794477144" },
  { rowIdx: 47, produto: "Fichas e Resumos de Letras", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4299287350328499&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104104989446273" },
];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const results = [];

  console.log('\n📊 COLETA DOS 12 PENDENTES — DIA 3 (27/05)\n');
  console.log('='.repeat(80));

  for (let i = 0; i < pending.length; i++) {
    const prod = pending[i];
    console.log(`\n[${i + 1}/${pending.length}] ${prod.produto}`);
    console.log('-'.repeat(80));

    try {
      console.log('📍 Navegando...');
      await page.goto(prod.link, { waitUntil: 'networkidle', timeout: 25000 })
        .catch(err => console.log('⚠️  Timeout:', err.message));

      console.log('⏳ Aguardando...');
      await page.waitForTimeout(3000);

      console.log('🚪 Fechando popup (Escape)...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);

      console.log('🔎 Lendo número...');
      let count = await page.evaluate(() => {
        const text = document.body.innerText;
        const patterns = [/~?(\d+)\s+resultados?/i, /(\d+)\s+resultados?/i];
        for (const p of patterns) {
          const m = text.match(p);
          if (m) return parseInt(m[1]);
        }
        return null;
      });

      if (count === null) {
        const isEmpty = await page.evaluate(() => {
          return document.querySelectorAll('[role="article"]').length === 0;
        });
        count = isEmpty ? 0 : 0;
      }

      console.log(`✅ ${count} anúncios`);
      results.push([prod.rowIdx, count]);

    } catch (err) {
      console.error(`❌ Erro: ${err.message}`);
      results.push([prod.rowIdx, 0]);
    }

    if (i < pending.length - 1) {
      console.log('⏸️  Aguardando 1s...');
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();

  console.log('\n' + '='.repeat(80));
  console.log('✅ COLETA CONCLUÍDA!\n');
  console.log('Resultados para gravar:');
  console.log(JSON.stringify(results, null, 2));

  const fs = require('fs');
  fs.writeFileSync('dados_dia3.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Salvos em dados_dia3.json');
})();
