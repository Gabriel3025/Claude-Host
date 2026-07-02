const puppeteer = require('puppeteer');
const fs = require('fs');

const produtos = [
  { rowIdx: 87, colDia: 15, produto: "Exercícios para TDAH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1539757124446179&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1032487749942829" },
  { rowIdx: 88, colDia: 15, produto: "Molde Roupa PET", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2186336145475706&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=798961839967726" },
  { rowIdx: 89, colDia: 15, produto: "Cristão + Hidroponica", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1157518119898256&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=764990176689674" },
  { rowIdx: 90, colDia: 15, produto: "TCC com IA (R$ 297,00)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1331009742267761&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103564767838055" },
  { rowIdx: 91, colDia: 15, produto: "Catalogo Estética automotiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2036457113610000&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=931344583397575" },
  { rowIdx: 92, colDia: 15, produto: "Atividades para idosos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1672177637162368&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=118549594571851" },
  { rowIdx: 93, colDia: 15, produto: "Atividades para copa", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=979861398247494&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=969531866239736" },
  { rowIdx: 94, colDia: 15, produto: "Adesivo Sono", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1319715983491748&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=902865936254343" },
  { rowIdx: 95, colDia: 15, produto: "Simulado CNH", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889272863572796&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=685480034656998" },
  { rowIdx: 96, colDia: 15, produto: "Matemática Minecraft", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1466436528832369&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1025559857302305" },
  { rowIdx: 97, colDia: 15, produto: "Desafio 21 dias Emagrec.", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=985099327616657&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=131485520040550" },
  { rowIdx: 98, colDia: 15, produto: "Brinquedos de Papel", link: "https://www.facebook.com/ads/library/?id=1321227846541377" },
  { rowIdx: 99, colDia: 14, produto: "A história do lider (Política)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27476307511973173&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=984175081437878" },
];

async function getCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 1500));

    const text = await page.evaluate(() => document.body.innerText);

    let match = text.match(/[~≈]?\s*([\d.,]+)\s*resultado/i);
    if (match) {
      const num = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    }
    if (/Nenhum anúncio|No ads|nenhum resultado/i.test(text)) return 0;
    return null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const resultados = [];
  console.log(`\nColetando ${produtos.length} produtos...\n`);

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    process.stdout.write(`[${i+1}/${produtos.length}] ${p.produto} ... `);
    const valor = await getCount(page, p.link);
    resultados.push({ rowIdx: p.rowIdx, colDia: p.colDia, produto: p.produto, valor });
    console.log(valor !== null ? `${valor}` : 'NÃO ENCONTRADO');
  }

  await browser.close();
  fs.writeFileSync('coleta_python.json', JSON.stringify(resultados, null, 2));
  console.log('\nSalvo em coleta_python.json');
}

main().catch(console.error);
