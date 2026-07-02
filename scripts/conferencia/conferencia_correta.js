const { chromium } = require('C:/tmp/node_modules/playwright');
const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Dados de hoje (DIA 4) do read_sheet.js
const HOJE = [
  { rowIdx: 1, colDia: 9, produto: "Atividade cursiva", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all", sheet: SHEET_ACOMP },
  { rowIdx: 8, colDia: 9, produto: "Jiujistu", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 12, colDia: 9, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 20, colDia: 9, produto: "Pacotes de músicas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038", sheet: SHEET_ACOMP },
  { rowIdx: 21, colDia: 9, produto: "200 dinamicas cristã", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027", sheet: SHEET_ACOMP },
  { rowIdx: 24, colDia: 9, produto: "Croche", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445", sheet: SHEET_ACOMP },
  { rowIdx: 26, colDia: 9, produto: "Ebook bibílico (Infant)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 27, colDia: 9, produto: "Ficha de Treino", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 28, colDia: 9, produto: "1.200 Moldes de Papel", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848", sheet: SHEET_ACOMP },
  { rowIdx: 29, colDia: 9, produto: "Exerc. Anatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 30, colDia: 9, produto: "100 Brincadeiras Bebês", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espaço%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo", sheet: SHEET_ACOMP },
  { rowIdx: 31, colDia: 9, produto: "Moldes em FOAM (Dol)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1438201469839415", sheet: SHEET_ACOMP },
  { rowIdx: 32, colDia: 9, produto: "Organização do Lar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343", sheet: SHEET_ACOMP },
  { rowIdx: 33, colDia: 9, produto: "DryWall", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593", sheet: SHEET_ACOMP },
  { rowIdx: 34, colDia: 9, produto: "Tarot", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050", sheet: SHEET_ACOMP },
  { rowIdx: 35, colDia: 9, produto: "Como plantar", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc", sheet: SHEET_ACOMP },
  { rowIdx: 36, colDia: 9, produto: "Neuropro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469", sheet: SHEET_ACOMP },
  { rowIdx: 37, colDia: 9, produto: "120 dinamicas infan", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=814376505087684", sheet: SHEET_ACOMP },
  { rowIdx: 38, colDia: 9, produto: "Moldes EVA", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=612639831936335", sheet: SHEET_ACOMP },
  { rowIdx: 39, colDia: 9, produto: "Airfryer", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604", sheet: SHEET_ACOMP },
  { rowIdx: 40, colDia: 9, produto: "Saude (Euro)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107", sheet: SHEET_ACOMP },
  { rowIdx: 41, colDia: 9, produto: "Emagrecimento", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306", sheet: SHEET_ACOMP },
  { rowIdx: 42, colDia: 9, produto: "100 Cards Anti-Bullying", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814", sheet: SHEET_ACOMP },
  { rowIdx: 43, colDia: 9, produto: "Planilha Capivarinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901", sheet: SHEET_ACOMP },
  { rowIdx: 44, colDia: 9, produto: "JiuJistsu (LATAM)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585", sheet: SHEET_ACOMP },
  { rowIdx: 45, colDia: 9, produto: "Kit Casinhas de Boneca", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=894236146555718&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=889932910880439", sheet: SHEET_ACOMP },
  { rowIdx: 46, colDia: 9, produto: "Kit Figurinhas Educativas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1286271340269388&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=520638794477144", sheet: SHEET_ACOMP },
  { rowIdx: 47, colDia: 9, produto: "Fichas e Resumos de Letras", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4299287350328499&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104104989446273", sheet: SHEET_ACOMP },
  { rowIdx: 48, colDia: 9, produto: "Projeto Marcenaria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=633981863122900", sheet: SHEET_ACOMP },
  { rowIdx: 49, colDia: 9, produto: "Bijuteria", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=866928149845118", sheet: SHEET_ACOMP },
  { rowIdx: 50, colDia: 9, produto: "Alfabetização", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=292286153965893", sheet: SHEET_ACOMP },
  { rowIdx: 51, colDia: 9, produto: "Creme AntRugas (DROP)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1030626216804522", sheet: SHEET_ACOMP },
  { rowIdx: 52, colDia: 9, produto: "Atividades Copa do mundo", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179", sheet: SHEET_ACOMP },
  { rowIdx: 53, colDia: 9, produto: "Calistenia asiática", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687", sheet: SHEET_ACOMP },
  { rowIdx: 54, colDia: 9, produto: "Religião LATAM", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=402138022974258", sheet: SHEET_ACOMP },
  { rowIdx: 55, colDia: 9, produto: "Dinamicas terapeuticas", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=519466767912828", sheet: SHEET_ACOMP },
  { rowIdx: 56, colDia: 9, produto: "Hora da Leiturinha", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347", sheet: SHEET_ACOMP },
  { rowIdx: 57, colDia: 9, produto: "EUAMOAnatomia", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=910225638850949", sheet: SHEET_ACOMP },
  { rowIdx: 58, colDia: 9, produto: "Cafajeste (Acompanhar OF)", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848", sheet: SHEET_ACOMP },
  { rowIdx: 59, colDia: 9, produto: "Sono bebe", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1011693332027445", sheet: SHEET_ACOMP },
  { rowIdx: 60, colDia: 9, produto: "Painel Campeões", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150", sheet: SHEET_ACOMP },
  { rowIdx: 61, colDia: 9, produto: "Dinamicas aulas de PTBR", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215", sheet: SHEET_ACOMP },
  { rowIdx: 62, colDia: 9, produto: "Planilha financeira", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839", sheet: SHEET_ACOMP },
  { rowIdx: 63, colDia: 9, produto: "Atividades da Pro", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150", sheet: SHEET_ACOMP },
  { rowIdx: 64, colDia: 9, produto: "Calistenia asiática 2 ", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687", sheet: SHEET_ACOMP },
  { rowIdx: 65, colDia: 9, produto: "Atividades de português", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410", sheet: SHEET_ACOMP },
  { rowIdx: 66, colDia: 9, produto: "Atividades em segundos", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190", sheet: SHEET_ACOMP },
  { rowIdx: 67, colDia: 9, produto: "Figurinhaa do filho", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877", sheet: SHEET_ACOMP },
  { rowIdx: 68, colDia: 7, produto: "Potinho da fé", link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167", sheet: SHEET_ACOMP },
];

function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cellAddr(c, r) { return colLetter(c) + (r + 1); }

async function getCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'networkidle', timeout: 25000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    const text = await page.evaluate(() => document.body.innerText);
    const match = text.match(/[~≈]?\s*([\d.,]+)\s*resultado/i);
    if (match) {
      const num = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    }
    if (/Nenhum anúncio|No ads|nenhum resultado/i.test(text)) return 0;
    const safe = link.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
    await page.screenshot({ path: `C:/Users/Administrador.LAURAFERREIRA/Downloads/Claude (Host)/debug_${safe}.png` });
    console.warn(`  ⚠ Sem número: ${link.slice(0, 50)}`);
    return null;
  } catch (e) {
    console.warn(`  ⚠ Erro: ${link.slice(0, 50)}`);
    return null;
  }
}

async function writeResults(resultsMap) {
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
  const oauthKeys = keys.installed || keys.web;
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
  auth.setCredentials({ access_token: creds.access_token, refresh_token: creds.refresh_token });
  const sheets = google.sheets({ version: 'v4', auth });

  const bySheet = {};
  for (const { rowIdx, colDia, value, sheet } of resultsMap) {
    if (value === null) continue;
    if (!bySheet[sheet]) bySheet[sheet] = [];
    bySheet[sheet].push({ range: cellAddr(colDia, rowIdx), values: [[value]] });
  }

  for (const [sheetId, data] of Object.entries(bySheet)) {
    const label = sheetId === SHEET_ACOMP ? 'Acompanhamento' : 'Radar';
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: sheetId,
      requestBody: { valueInputOption: 'RAW', data },
    });
    console.log(`✓ ${label}: ${data.length} células gravadas`);
  }
}

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultsMap = [];

  console.log(`\n🔍 Coletando ${HOJE.length} produtos de hoje...\n`);

  for (let i = 0; i < HOJE.length; i++) {
    const task = HOJE[i];
    process.stdout.write(`[${i + 1}/${HOJE.length}] ${task.produto}... `);
    const value = await getCount(page, task.link);
    console.log(value !== null ? `→ ${value}` : '→ FALHOU');
    resultsMap.push({ rowIdx: task.rowIdx, colDia: task.colDia, value, sheet: task.sheet });
  }

  await browser.close();

  console.log('\n📊 Resumo:');
  HOJE.forEach((t, i) => {
    const v = resultsMap[i].value;
    console.log(`  [${t.rowIdx},${t.colDia}] ${t.produto}: ${v !== null ? v : '❌'}`);
  });

  console.log('\n💾 Gravando nas planilhas (linhas e colunas corretas)...');
  await writeResults(resultsMap);
  console.log('\n✅ Conferência concluída!');
})();
