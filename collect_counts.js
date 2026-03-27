const { chromium } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Local/npm-cache/_npx/9833c18b2d85bc59/node_modules/playwright');

const links = [
  // === AMBAS AS PLANILHAS (11) ===
  { id: 1,  label: 'Próxy Enzimático',        url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=prontocoloenzimatico20026.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 2,  label: 'Médoto P.E.I',            url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=protocolo-pei-youtube.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 3,  label: 'Aprovação Concursos',     url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889310450166601&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=676208382232077' },
  { id: 4,  label: 'Album Casamento',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=784759594567490&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=313172685220983' },
  { id: 5,  label: 'Pacotes de músicas',      url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038' },
  { id: 6,  label: '200 dinamicas cristã',    url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027' },
  { id: 7,  label: 'Venda Física (cristã)',   url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=rosamisterio.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 8,  label: 'Bonecos bíblicos',        url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=bonequinhosbiblicos.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 9,  label: 'Eternizando memórias',    url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1562317518183412&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477' },
  { id: 10, label: 'Croche',                  url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445' },
  { id: 11, label: 'Ebook bíblico (Infant)',  url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  // === SOMENTE ACOMPANHAMENTO (13) ===
  { id: 12, label: 'Saxofone',                url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=metodosax.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 13, label: 'Ficha de Treino',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 14, label: '1.200 Moldes de Papel',   url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848' },
  { id: 15, label: 'Exerc. Anatomia',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 16, label: '100 Brincadeiras Bebês',  url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo' },
  { id: 17, label: 'Moldes em FOAM (Dol)',    url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415' },
  { id: 18, label: 'Organização do Lar',      url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343' },
  { id: 19, label: 'DryWall',                 url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593' },
  { id: 20, label: 'Tarot',                   url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050' },
  { id: 21, label: 'Como plantar',            url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 22, label: 'Neuropro',                url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469' },
  { id: 23, label: '120 dinamicas infan',     url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684' },
  { id: 24, label: 'Moldes EVA',              url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335' },
  // === SOMENTE RADAR (2) ===
  { id: 25, label: 'Calistenia kids',         url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=calisteniakids.com.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc' },
  { id: 26, label: 'Calcinhas (DROP)',        url: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1684748261643829' },
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
