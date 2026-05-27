const { chromium } = require('playwright');
const fs = require('fs');

const products = [
  { rowIdx: 1, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 8, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 20, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
];

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  page.setDefaultTimeout(25000);

  console.log('\n🔍 EXTRAÇÃO ROBUSTA - 4 PRIMEIROS PRODUTOS\n');
  console.log('='.repeat(70));

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    console.log(`\n[${i + 1}/4] ${prod.produto}`);
    console.log('-'.repeat(70));

    try {
      console.log('📍 Navegando para: ' + prod.link.substring(0, 60) + '...');
      await page.goto(prod.link, {
        waitUntil: 'networkidle',
        timeout: 25000
      }).catch(err => console.log('⚠️  Goto timeout (continuando...)', err.message));

      console.log('⏳ Aguardando carregamento dinâmico...');
      await page.waitForTimeout(3000);

      console.log('🚪 Fechando popups...');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);

      // Estratégia 1: Procurar elemento que contenha "resultados"
      console.log('🔎 Estratégia 1: Procurando por padrão "resultados"...');
      let count = await page.evaluate(() => {
        const allText = document.body.innerText;

        // Regex mais flexível
        const patterns = [
          /~?(\d+)\s+resultados?/i,
          /(\d+)\s+resultados?/i,
          /~?(\d+)\s+results?/i,
          /(\d+)\s+results?/i,
        ];

        for (const pattern of patterns) {
          const match = allText.match(pattern);
          if (match) {
            console.log(`   ✓ Encontrado: ${match[1]} resultados`);
            return parseInt(match[1]);
          }
        }

        return null;
      });

      // Estratégia 2: Procurar por XPath específico do Facebook
      if (count === null) {
        console.log('🔎 Estratégia 2: Procurando por estrutura do Facebook...');
        count = await page.evaluate(() => {
          // Facebook coloca o número em diferentes lugares dependendo da página
          const allSpans = document.querySelectorAll('span, div, p');
          for (const el of allSpans) {
            const text = el.innerText;
            if (text && text.match(/^\d+\s*$/)) {
              const num = parseInt(text);
              if (num > 0 && num < 10000) {
                console.log(`   ✓ Encontrado em elemento: ${num}`);
                return num;
              }
            }
          }
          return null;
        });
      }

      // Estratégia 3: Se página em branco = 0 anúncios
      if (count === null) {
        console.log('🔎 Estratégia 3: Verificando se página está em branco...');
        const isEmpty = await page.evaluate(() => {
          const ads = document.querySelectorAll('[role="article"], .ad-item, .advertisement');
          return ads.length === 0;
        });

        if (isEmpty) {
          console.log('   ℹ️  Página em branco = 0 anúncios');
          count = 0;
        }
      }

      // Fallback: tirar screenshot e avisar
      if (count === null) {
        console.log('❌ Não consegui extrair automaticamente. Tire screenshot:');
        const screenshotPath = `screenshot_${prod.rowIdx}.png`;
        await page.screenshot({ path: screenshotPath });
        console.log(`   📸 Screenshot salvo: ${screenshotPath}`);
        console.log('   👉 Verifique a imagem e me diga o número');
        count = 0; // Placeholder
      }

      console.log(`\n✅ Resultado: ${count} anúncios`);
      console.log('='.repeat(70));

    } catch (err) {
      console.error(`❌ Erro ao processar: ${err.message}`);
    }

    // Pausa entre produtos
    if (i < products.length - 1) {
      console.log('⏸️  Aguardando 2 segundos...');
      await page.waitForTimeout(2000);
    }
  }

  await browser.close();
  console.log('\n✅ Script finalizado!');
})();
