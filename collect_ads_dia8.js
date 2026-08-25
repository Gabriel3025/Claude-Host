const { chromium } = require('playwright');
const fs = require('fs');

const PENDING_PRODUCTS = [
  { rowIdx: 1, colDia: 13, produto: 'Tarot', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050' },
  { rowIdx: 8, colDia: 13, produto: 'Como plantar', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { rowIdx: 12, colDia: 13, produto: 'Neuropro', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469' },
  { rowIdx: 20, colDia: 13, produto: 'Airfryer', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604' },
  { rowIdx: 30, colDia: 13, produto: 'Saude (Euro)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107' },
  { rowIdx: 32, colDia: 13, produto: 'Emagrecimento', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306' },
  { rowIdx: 33, colDia: 13, produto: 'Atividade cursiva', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all' },
  { rowIdx: 34, colDia: 13, produto: 'Jiujistu', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { rowIdx: 39, colDia: 13, produto: '100 Brincadeiras Bebês', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo' },
  { rowIdx: 40, colDia: 13, produto: 'Organização do Lar', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343' },
  { rowIdx: 42, colDia: 13, produto: '100 Cards Anti-Bullying', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814' },
  { rowIdx: 43, colDia: 13, produto: 'Planilha Capivarinha', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901' },
  { rowIdx: 44, colDia: 13, produto: 'JiuJistsu (LATAM)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585' },
  { rowIdx: 52, colDia: 13, produto: 'Atividades Copa do mundo', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179' },
];

async function extractAdCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const text = await page.evaluate(() => document.body.innerText);

    // Regex para "~X resultados" ou "Nenhum anúncio"
    const matchResults = text.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
    if (matchResults) {
      return parseInt(matchResults[1].replace(/\D/g, ''), 10);
    }

    // Se não encontrou anúncios
    if (text.includes('Nenhum anúncio corresponde')) {
      return 0;
    }

    console.warn('  ⚠️  Não conseguiu extrair - será reprocessado');
    return null;
  } catch (err) {
    console.warn(`  ❌ Erro: ${err.message}`);
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const results = [];
  const falhas = [];

  console.log('📊 Coletando dados de anúncios via Playwright...\n');

  for (let i = 0; i < PENDING_PRODUCTS.length; i++) {
    const produto = PENDING_PRODUCTS[i];
    console.log(`[${i + 1}/${PENDING_PRODUCTS.length}] ${produto.produto}...`);

    const valor = await extractAdCount(page, produto.link);

    if (valor !== null) {
      results.push({
        rowIdx: produto.rowIdx,
        colDia: produto.colDia,
        produto: produto.produto,
        valor: valor
      });
      console.log(`  ✅ ${valor} anúncios\n`);
    } else {
      falhas.push({ rowIdx: produto.rowIdx, produto: produto.produto });
      console.log('');
    }
  }

  await browser.close();

  console.log(`\n✅ Coletados: ${results.length}/${PENDING_PRODUCTS.length}`);
  if (falhas.length > 0) {
    console.log(`⚠️  Falhas: ${falhas.length}`);
    console.log('Falhas:', falhas.map(f => f.produto).join(', '));
  }

  console.log('\n📋 Resultados:');
  console.log(JSON.stringify(results, null, 2));

  fs.writeFileSync('results_dia8.json', JSON.stringify(results, null, 2));
  console.log('\n✅ Salvos em: results_dia8.json');
}

main().catch(console.error);
