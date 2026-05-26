const { chromium } = require('playwright');
const fs = require('fs');

// Links dos 51 produtos (em ordem de rowIdx)
const allLinks = [
  { rowIdx: 1, linha: 2, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 8, linha: 9, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, linha: 13, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 20, linha: 21, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 21, linha: 22, produto: "200 dinamicas cristã", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027" },
  { rowIdx: 24, linha: 25, produto: "Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 26, linha: 27, produto: "Ebook bibílico (Infant)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 27, linha: 28, produto: "Ficha de Treino", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 28, linha: 29, produto: "1.200 Moldes de Papel", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848" },
  { rowIdx: 29, linha: 30, produto: "Exerc. Anatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 30, linha: 31, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { rowIdx: 31, linha: 32, produto: "Moldes em FOAM (Dol)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415" },
  { rowIdx: 32, linha: 33, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { rowIdx: 33, linha: 34, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { rowIdx: 34, linha: 35, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 35, linha: 36, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, linha: 37, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { rowIdx: 37, linha: 38, produto: "120 dinamicas infan", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684" },
  { rowIdx: 38, linha: 39, produto: "Moldes EVA", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335" },
  { rowIdx: 39, linha: 40, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 40, linha: 41, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 41, linha: 42, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 42, linha: 43, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 43, linha: 44, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { rowIdx: 44, linha: 45, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { rowIdx: 45, linha: 46, produto: "Kit Casinhas de Boneca", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=894236146555718&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=889932910880439" },
  { rowIdx: 46, linha: 47, produto: "Kit Figurinhas Educativas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1286271340269388&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=520638794477144" },
  { rowIdx: 47, linha: 48, produto: "Fichas e Resumos de Letras", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4299287350328499&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104104989446273" },
  { rowIdx: 48, linha: 49, produto: "Projeto Marcenaria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=633981863122900" },
  { rowIdx: 49, linha: 50, produto: "Bijuteria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=866928149845118" },
  { rowIdx: 50, linha: 51, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=292286153965893" },
  { rowIdx: 51, linha: 52, produto: "Creme AntRugas (DROP)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1030626216804522" },
  { rowIdx: 52, linha: 53, produto: "Atividades Copa do mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179" },
  { rowIdx: 53, linha: 54, produto: "Calistenia asiática", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 54, linha: 55, produto: "Religião LATAM", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=402138022974258" },
  { rowIdx: 55, linha: 56, produto: "Dinamicas terapeuticas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=519466767912828" },
  { rowIdx: 56, linha: 57, produto: "Hora da Leiturinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347" },
  { rowIdx: 57, linha: 58, produto: "EUAMOAnatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=910225638850949" },
  { rowIdx: 58, linha: 59, produto: "Cafajeste (Acompanhar OF)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848" },
  { rowIdx: 59, linha: 60, produto: "Sono bebe", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1011693332027445" },
  { rowIdx: 60, linha: 61, produto: "Painel Campeões", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 61, linha: 62, produto: "Dinamicas aulas de PTBR", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215" },
  { rowIdx: 62, linha: 63, produto: "Planilha financeira", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839" },
  { rowIdx: 63, linha: 64, produto: "Atividades da Pro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 64, linha: 65, produto: "Calistenia asiática 2 ", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 65, linha: 66, produto: "Atividades de português", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410" },
  { rowIdx: 66, linha: 67, produto: "Atividades em segundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190" },
  { rowIdx: 67, linha: 68, produto: "Figurinhaa do filho", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877" },
  { rowIdx: 68, linha: 69, produto: "Diâmica equações", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=490555230814108" },
  { rowIdx: 69, linha: 70, produto: "Temperos da Ju", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323991704125348" },
  { rowIdx: 70, linha: 71, produto: "Dinamica Tabuada", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=843674562155900" },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const resultados = [];

  for (let i = 0; i < allLinks.length; i++) {
    const item = allLinks[i];
    try {
      process.stdout.write(`[${i+1}/${allLinks.length}] ${item.produto}... `);

      await page.goto(item.link, { waitUntil: 'domcontentloaded', timeout: 20000 });

      try {
        await page.press('Escape');
      } catch (e) {}

      await page.waitForTimeout(1500);

      const text = await page.locator('body').textContent();
      const match = text.match(/~?(\d+)\s*resultados?/i);
      const count = match ? parseInt(match[1]) : 0;

      resultados.push({ linha: item.linha, coluna: 'H', valor: count });
      console.log(`${count}`);
    } catch (err) {
      console.log(`ERRO`);
      resultados.push({ linha: item.linha, coluna: 'H', valor: 0 });
    }
  }

  await browser.close();
  fs.writeFileSync('resultados_h.json', JSON.stringify(resultados, null, 2));
  console.log('\n✅ Coleta completa!');
})();
