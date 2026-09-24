const { chromium } = require('playwright');

const falhas = [
  { rowIdx: 1, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 8, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 69, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764" },
  { rowIdx: 81, produto: "Quadro com versículos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963" },
  { rowIdx: 82, produto: "Bolsas Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 83, produto: "Hora de aprender cristão", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultados = [];
  const aindaFalhas = [];

  for (let i = 0; i < falhas.length; i++) {
    const p = falhas[i];
    try {
      console.log(`[${i+1}/${falhas.length}] ${p.produto} (reprocessando com mais tempo)...`);
      await page.goto(p.link, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(5000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);

      const texto = await page.evaluate(() => document.body.innerText);

      const matchResultados = texto.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
      if (matchResultados) {
        const valor = parseInt(matchResultados[1].replace(/[.,]/g, ''), 10);
        resultados.push({ rowIdx: p.rowIdx, produto: p.produto, valor, status: 'OK' });
        console.log(`  -> ${valor} anúncios`);
      } else if (texto.includes('Nenhum anúncio corresponde') || texto.includes('No ads match')) {
        resultados.push({ rowIdx: p.rowIdx, produto: p.produto, valor: 0, status: 'ZERO_REAL' });
        console.log(`  -> 0 anúncios (nenhum encontrado)`);
      } else {
        // Dump more text for debugging
        const snippet = texto.substring(0, 800);
        aindaFalhas.push({ rowIdx: p.rowIdx, produto: p.produto, texto: snippet });
        console.log(`  -> AINDA FALHA. Texto: ${snippet.substring(0, 200)}`);
      }
    } catch (err) {
      aindaFalhas.push({ rowIdx: p.rowIdx, produto: p.produto, erro: err.message });
      console.log(`  -> ERRO: ${err.message}`);
    }
  }

  await browser.close();

  console.log('\n=== RESULTADOS REPROCESSADOS ===');
  console.log(JSON.stringify({ resultados, aindaFalhas }, null, 2));
})();
