const { chromium } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');

const links = [
  // === ACOMPANHAMENTO OFERTAS ===
  { id: 1,  label: 'Ficha de Treino',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 2,  label: '1.200 Moldes de Papel',   url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848' },
  { id: 3,  label: 'Exerc. Anatomia',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 4,  label: '100 Brincadeiras Bebês',  url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo' },
  { id: 5,  label: 'Moldes em FOAM (Dol)',    url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415' },
  { id: 6,  label: 'Organização do Lar',      url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343' },
  { id: 7,  label: 'DryWall',                 url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593' },
  { id: 8,  label: 'Tarot',                   url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050' },
  { id: 9,  label: 'Como plantar',            url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 10, label: 'Neuropro',                url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469' },
  { id: 11, label: '120 dinamicas infan',     url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684' },
  { id: 12, label: 'Moldes EVA',              url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335' },
  { id: 13, label: 'Airfryer',                url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604' },
  { id: 14, label: 'Saude (Euro)',             url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107' },
  // === RADAR DE OFERTAS ===
  { id: 15, label: 'Calcinhas (DROP)',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1684748261643829' },
];

function parseCount(text) {
  if (!text) return 0;
  const match = text.match(/~?([\d,\.]+)\s*result/i) || text.match(/~?([\d,\.]+)\s*resultado/i) || text.match(/([\d,\.]+)/);
  if (!match) return 0;
  return parseInt(match[1].replace(/[,\.]/g, ''), 10) || 0;
}

async function getCount(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);

    try {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (_) {}

    const selectors = [
      '[data-testid="ad_library_main_content"] span',
      'div[role="main"] h3',
      'h3',
      '[class*="result"] span',
    ];

    let countText = null;
    for (const sel of selectors) {
      const elements = await page.$$(sel);
      for (const el of elements) {
        const txt = await el.innerText().catch(() => '');
        if (/result|resultado/i.test(txt) || /~?\d[\d,\.]*/.test(txt)) {
          countText = txt;
          break;
        }
      }
      if (countText) break;
    }

    if (!countText) {
      const bodyText = await page.evaluate(() => document.body.innerText);
      const match = bodyText.match(/~?([\d,\.]+)\s*(results?|resultados?)/i);
      if (match) countText = match[0];
    }

    const count = parseCount(countText);
    return count;
  } catch (e) {
    return -1;
  }
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const results = [];

  for (const item of links) {
    process.stderr.write(`[${item.id}/${links.length}] ${item.label}...\n`);
    const count = await getCount(page, item.url);
    results.push({ id: item.id, label: item.label, count });
    process.stderr.write(`  → ${count}\n`);
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
