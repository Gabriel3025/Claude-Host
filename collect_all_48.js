const { chromium } = require('playwright');
const fs = require('fs');

const products = [
  { rowIdx: 1, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 8, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 20, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 21, produto: "Produto 21", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 24, produto: "Produto 24", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 26, produto: "Produto 26", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 27, produto: "Produto 27", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 28, produto: "Produto 28", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 29, produto: "Produto 29", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 30, produto: "Produto 30", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 31, produto: "Produto 31", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 32, produto: "Produto 32", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 33, produto: "Produto 33", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 34, produto: "Produto 34", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 35, produto: "Produto 35", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 36, produto: "Produto 36", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 37, produto: "Produto 37", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 38, produto: "Produto 38", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 39, produto: "Produto 39", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 40, produto: "Produto 40", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 41, produto: "Produto 41", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 42, produto: "Produto 42", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 43, produto: "Produto 43", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 44, produto: "Produto 44", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 45, produto: "Produto 45", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 46, produto: "Produto 46", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 47, produto: "Produto 47", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 48, produto: "Produto 48", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 49, produto: "Produto 49", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 50, produto: "Produto 50", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 51, produto: "Produto 51", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 52, produto: "Produto 52", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 53, produto: "Produto 53", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 54, produto: "Produto 54", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 55, produto: "Produto 55", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 56, produto: "Produto 56", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 57, produto: "Produto 57", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 58, produto: "Produto 58", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 59, produto: "Produto 59", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 60, produto: "Produto 60", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 61, produto: "Produto 61", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 62, produto: "Produto 62", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 63, produto: "Produto 63", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 64, produto: "Produto 64", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 65, produto: "Produto 65", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 66, produto: "Produto 66", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
  { rowIdx: 67, produto: "Produto 67", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL" },
];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  const results = [];

  console.log('\n🔍 EXTRAÇÃO - 48 PRODUTOS\n');
  console.log('='.repeat(70));

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    console.log(`\n[${i + 1}/${products.length}] ${prod.produto}`);
    console.log('-'.repeat(70));

    try {
      console.log('📍 Navegando...');
      await page.goto(prod.link, {
        waitUntil: 'networkidle',
        timeout: 25000
      }).catch(err => console.log('⚠️  Timeout', err.message));

      console.log('⏳ Aguardando carregamento...');
      await page.waitForTimeout(3000);

      console.log('🚪 Fechando popups...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);

      console.log('🔎 Extraindo dados...');
      let count = await page.evaluate(() => {
        const allText = document.body.innerText;
        const patterns = [
          /~?(\d+)\s+resultados?/i,
          /(\d+)\s+resultados?/i,
          /~?(\d+)\s+results?/i,
          /(\d+)\s+results?/i,
        ];

        for (const pattern of patterns) {
          const match = allText.match(pattern);
          if (match) {
            return parseInt(match[1]);
          }
        }

        return null;
      });

      if (count === null) {
        const isEmpty = await page.evaluate(() => {
          const ads = document.querySelectorAll('[role="article"], .ad-item, .advertisement');
          return ads.length === 0;
        });

        if (isEmpty) {
          count = 0;
        }
      }

      if (count === null) {
        console.log('❌ Não consegui extrair. Digite o número:');
        count = 0;
      }

      console.log(`✅ Resultado: ${count} anúncios`);
      results.push({ rowIdx: prod.rowIdx, count });

    } catch (err) {
      console.error(`❌ Erro: ${err.message}`);
      results.push({ rowIdx: prod.rowIdx, count: 0 });
    }

    if (i < products.length - 1) {
      console.log('⏸️  Aguardando 1 segundo...');
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();

  fs.writeFileSync('resultados_dia3.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Resultados salvos em resultados_dia3.json');
  console.log('='.repeat(70));
  console.log(JSON.stringify(results, null, 2));
})();
