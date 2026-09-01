const { chromium } = require('playwright');
const fs = require('fs');

const produtos = [
  {"rowIdx":1,"produto":"Tarot","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050"},
  {"rowIdx":8,"produto":"Como plantar","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
  {"rowIdx":12,"produto":"Neuropro","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469"},
  {"rowIdx":20,"produto":"Airfryer","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604"},
  {"rowIdx":30,"produto":"Saude (Euro)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107"},
  {"rowIdx":32,"produto":"Emagrecimento","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306"},
  {"rowIdx":33,"produto":"Atividade cursiva","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all"},
  {"rowIdx":34,"produto":"Jiujistu","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc"},
  {"rowIdx":39,"produto":"100 Brincadeiras Bebês","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo"},
  {"rowIdx":40,"produto":"Organização do Lar","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343"},
  {"rowIdx":42,"produto":"100 Cards Anti-Bullying","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814"},
  {"rowIdx":43,"produto":"Planilha Capivarinha","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901"},
  {"rowIdx":44,"produto":"JiuJistsu (LATAM)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585"},
  {"rowIdx":52,"produto":"Atividades Copa do mundo","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179"},
  {"rowIdx":53,"produto":"Calistenia asiática","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687"},
  {"rowIdx":56,"produto":"Hora da Leiturinha","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347"},
  {"rowIdx":58,"produto":"Cafajeste (Acompanhar OF)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848"},
  {"rowIdx":60,"produto":"Painel Campeões","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150"},
  {"rowIdx":61,"produto":"Dinamicas aulas de PTBR","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215"},
  {"rowIdx":62,"produto":"Planilha financeira","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839"},
  {"rowIdx":63,"produto":"Atividades da Pro","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150"},
  {"rowIdx":64,"produto":"Calistenia asiática 2 ","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687"},
  {"rowIdx":65,"produto":"Atividades de português","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410"},
  {"rowIdx":66,"produto":"Atividades em segundos","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190"},
  {"rowIdx":67,"produto":"Figurinhaa do filho","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877"},
  {"rowIdx":68,"produto":"Potinho da fé","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167"},
  {"rowIdx":69,"produto":"Alfabetização","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764"},
  {"rowIdx":70,"produto":"ABA no Autismo","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=2355407888026229"},
  {"rowIdx":71,"produto":"KIT de costura (Acomapnhar)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103027082609605"},
  {"rowIdx":72,"produto":"Baralho do coração aberto","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1009496725582636"},
  {"rowIdx":73,"produto":"Jogo da Memória da Copa","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1329141256012536&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1041598825693538"},
  {"rowIdx":74,"produto":"Colorir Copa do Mundo","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1920654611973945&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1108292285704598"},
  {"rowIdx":75,"produto":"Artes para Terraplanagem","link":"https://www.facebook.com/ads/library/?id=711781368658553"},
  {"rowIdx":76,"produto":"Logo","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2146722662816707&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=277295208806442"},
  {"rowIdx":77,"produto":"TDAH","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1314783087281541&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=363096403554825"},
  {"rowIdx":78,"produto":"Segredo do bebe","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1895457088077461&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477"},
  {"rowIdx":79,"produto":"80 recursos terapeuticos","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2014856769454001&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=456601417538756"},
  {"rowIdx":80,"produto":"Acelerar aprendizado da cria","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2419112398599913&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079576205235125"},
  {"rowIdx":81,"produto":"Quadro com versículos","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963"},
  {"rowIdx":82,"produto":"Bolsas Croche","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445"},
  {"rowIdx":83,"produto":"Hora de aprender cristão","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774"},
  {"rowIdx":84,"produto":"Materiais para professores","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2185778578837548&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=128822573650748"},
  {"rowIdx":85,"produto":"Pack Figurinhas","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=929442639749702&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=123045347437517"},
  {"rowIdx":86,"produto":"Pack Figurinhas Copa ","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=921717424316509&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1027166040489643"},
  {"rowIdx":87,"produto":"Exercícios para TDAH","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1539757124446179&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1032487749942829"},
  {"rowIdx":88,"produto":"Molde Roupa PET","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2186336145475706&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=798961839967726"},
  {"rowIdx":89,"produto":"Cristão + Hidroponica","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1157518119898256&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=764990176689674"},
  {"rowIdx":90,"produto":"TCC com IA (R$ 297,00)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1331009742267761&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103564767838055"},
  {"rowIdx":91,"produto":"Catalogo Estética automotiva","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2036457113610000&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=931344583397575"},
  {"rowIdx":92,"produto":"Atividades para idosos","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1672177637162368&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=118549594571851"},
  {"rowIdx":93,"produto":"Atividades para copa","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=979861398247494&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=969531866239736"},
  {"rowIdx":94,"produto":"Adesivo Sono","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1319715983491748&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=902865936254343"},
  {"rowIdx":95,"produto":"Simulado CNH","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889272863572796&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=685480034656998"},
  {"rowIdx":96,"produto":"Matemática Minecraft","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1466436528832369&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1025559857302305"},
  {"rowIdx":97,"produto":"Desafio 21 dias Emagrec.","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=985099327616657&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=131485520040550"},
  {"rowIdx":98,"produto":"Brinquedos de Papel","link":"https://www.facebook.com/ads/library/?id=1321227846541377"},
  {"rowIdx":99,"produto":"A história do lider (Política)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27476307511973173&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=984175081437878"},
  {"rowIdx":100,"produto":"Dor na coluna (Acompanhar)","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=993103153456160&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=809142178952032"},
  {"rowIdx":101,"produto":"Bolsas de Crochê","link":"https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1052804377422472&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=268899600582377"}
];

function extract(text) {
  let m = text.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
  if (m) return parseInt(m[1].replace(/[.,]/g, ''), 10);
  if (/Nenhum anúncio corresponde aos seus crit[ée]rios/i.test(text)) return 0;
  m = text.match(/(\d[\d.,]*)\s*resultados?/i);
  if (m) return parseInt(m[1].replace(/[.,]/g, ''), 10);
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();
  const resultados = [];
  const falhas = [];

  for (const p of produtos) {
    try {
      await page.goto(p.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(2800);
      try { await page.keyboard.press('Escape'); } catch (e) {}
      await page.waitForTimeout(500);
      const text = await page.evaluate(() => document.body.innerText);
      const valor = extract(text);
      if (valor === null) {
        falhas.push({ ...p, textSample: text.slice(0, 500) });
        console.log(`FALHA: ${p.produto}`);
      } else {
        resultados.push({ rowIdx: p.rowIdx, produto: p.produto, valor });
        console.log(`OK: ${p.produto} = ${valor}`);
      }
    } catch (e) {
      falhas.push({ ...p, error: e.message });
      console.log(`ERRO: ${p.produto} - ${e.message}`);
    }
  }

  await browser.close();

  fs.writeFileSync('scratch_resultados_dia1.json', JSON.stringify(resultados, null, 2));
  fs.writeFileSync('scratch_falhas_dia1.json', JSON.stringify(falhas, null, 2));
  console.log(`\nTotal OK: ${resultados.length} / Falhas: ${falhas.length}`);
})();
