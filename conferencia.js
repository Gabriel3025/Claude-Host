const { chromium } = require('C:/tmp/node_modules/playwright');
const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// ─── Mapeamento único de links ─────────────────────────────────────────────
// Cada item: { produto, link, targets: [{sheetId, rowIdx, colDia}] }
const TASKS = [
  { produto: 'DoramaFlix', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=doramatvflix.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 3, c: 14 }, { s: SHEET_RADAR, r: 3, c: 15 }] },
  { produto: 'Receitas rápidas', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=receitasmarifryer.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 4, c: 14 }, { s: SHEET_RADAR, r: 4, c: 15 }] },
  { produto: 'Cristão (geo-biblica)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=geografia-biblica-es.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 5, c: 14 }, { s: SHEET_RADAR, r: 5, c: 15 }] },
  { produto: 'Aprender Kids', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicaspraticas.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 6, c: 14 }, { s: SHEET_RADAR, r: 6, c: 15 }] },
  { produto: 'Treino Futsal', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=120treinosfutsalpro.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 7, c: 14 }, { s: SHEET_RADAR, r: 7, c: 15 }] },
  { produto: 'Jiujitsu', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 8, c: 14 }, { s: SHEET_RADAR, r: 8, c: 15 }] },
  { produto: 'Cristão (biblical-geo)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=biblical-geography.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 9, c: 14 }, { s: SHEET_RADAR, r: 10, c: 15 }] },
  { produto: 'Protocolo gelatina', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=metodogelatinaexclusivo.lovable.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 10, c: 14 }, { s: SHEET_RADAR, r: 11, c: 15 }] },
  { produto: 'Receitas (Marmita Fit)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=refeicoesrapidas.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 11, c: 14 }, { s: SHEET_RADAR, r: 16, c: 15 }] },
  { produto: 'Alfabetização', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 12, c: 14 }, { s: SHEET_RADAR, r: 17, c: 15 }] },
  { produto: 'Recheios', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-recheios-de-pascoa.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 13, c: 14 }, { s: SHEET_RADAR, r: 18, c: 15 }] },
  { produto: 'Exercicios (Black)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=kegel-x-land.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 14, c: 14 }, { s: SHEET_RADAR, r: 19, c: 15 }] },
  { produto: '365 Versículos bíblia', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=iziwap.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 15, c: 14 }, { s: SHEET_RADAR, r: 20, c: 15 }] },
  { produto: 'Próxy Enzimático', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=prontocoloenzimatico20026.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 16, c: 11 }, { s: SHEET_RADAR, r: 22, c: 12 }] },
  { produto: 'Método P.E.I', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=protocolo-pei-youtube.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 17, c: 11 }, { s: SHEET_RADAR, r: 23, c: 12 }] },
  { produto: 'Aprovação Concursos', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=889310450166601&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=676208382232077', targets: [{ s: SHEET_ACOMP, r: 18, c: 11 }, { s: SHEET_RADAR, r: 24, c: 12 }] },
  { produto: 'Album Casamento', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=784759594567490&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=313172685220983', targets: [{ s: SHEET_ACOMP, r: 19, c: 11 }, { s: SHEET_RADAR, r: 25, c: 12 }] },
  { produto: 'Pacotes de músicas', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038', targets: [{ s: SHEET_ACOMP, r: 20, c: 11 }, { s: SHEET_RADAR, r: 26, c: 12 }] },
  { produto: '200 dinâmicas cristã', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1278286264147697&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=243655375492027', targets: [{ s: SHEET_ACOMP, r: 21, c: 11 }, { s: SHEET_RADAR, r: 27, c: 12 }] },
  { produto: 'Venda Física (cristã)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=rosamisterio.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 22, c: 11 }, { s: SHEET_RADAR, r: 28, c: 12 }] },
  { produto: 'Bonecos bíblicos', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=bonequinhosbiblicos.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 23, c: 11 }, { s: SHEET_RADAR, r: 29, c: 12 }] },
  { produto: 'Eternizando memórias', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1562317518183412&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477', targets: [{ s: SHEET_ACOMP, r: 24, c: 11 }, { s: SHEET_RADAR, r: 30, c: 12 }] },
  { produto: 'Croche', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1232138571920008&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445', targets: [{ s: SHEET_ACOMP, r: 25, c: 11 }, { s: SHEET_RADAR, r: 31, c: 12 }] },
  { produto: 'Saxofone', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=metodosax.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 26, c: 11 }, { s: SHEET_RADAR, r: 15, c: 15 }] },
  { produto: 'Ebook bíblico (Infant)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=editorasamil.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 27, c: 8 }, { s: SHEET_RADAR, r: 33, c: 9 }] },
  // ── Apenas Acompanhamento ──
  { produto: 'Ficha de Treino', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=henriquemiguel.com&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 28, c: 7 }] },
  { produto: '1.200 Moldes de Papel', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=887863197496315&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=712748111924848', targets: [{ s: SHEET_ACOMP, r: 29, c: 7 }] },
  { produto: 'Exerc. Anatomia', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=centraldaeducacao.site&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_ACOMP, r: 30, c: 7 }] },
  // ── Apenas Radar ──
  { produto: 'Cristão (omapa)', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=omapadabibliabr.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_RADAR, r: 9, c: 15 }] },
  { produto: 'Calistenia', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=atlas-calisthenics-funnel.lovable.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_RADAR, r: 12, c: 15 }] },
  { produto: 'GPT para nutricionistas', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=promptsnutricionista.lovable.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_RADAR, r: 13, c: 15 }] },
  { produto: 'Modelos de Story', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=instagram-stories-de-bc5f.bolt.host&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_RADAR, r: 14, c: 15 }] },
  { produto: 'Caligrafia', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Caligrafia%20305&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo', targets: [{ s: SHEET_RADAR, r: 21, c: 15 }] },
  { produto: 'Calistenia kids', link: 'https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=calisteniakids.com.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc', targets: [{ s: SHEET_RADAR, r: 32, c: 9 }] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────
function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cellAddr(c, r) { return colLetter(c) + (r + 1); }

async function getCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'networkidle', timeout: 25000 });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);

    // Tenta ler "~X resultados" ou "X resultados"
    const text = await page.evaluate(() => document.body.innerText);
    const match = text.match(/[~≈]?\s*([\d.,]+)\s*resultado/i);
    if (match) {
      const num = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    }
    // Se página em branco / sem resultados
    if (/Nenhum anúncio|No ads|nenhum resultado/i.test(text)) return 0;
    // Screenshot para debug
    const safe = link.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
    await page.screenshot({ path: `C:/Users/Administrador.LAURAFERREIRA/Downloads/Claude (Host)/debug_${safe}.png` });
    console.warn(`  ⚠ Não encontrou número em: ${link.slice(0, 60)}`);
    return null;
  } catch (e) {
    console.warn(`  ⚠ Erro ao acessar: ${link.slice(0, 60)} — ${e.message.split('\n')[0]}`);
    return null;
  }
}

// ─── Google Sheets write ─────────────────────────────────────────────────
async function writeResults(resultsMap) {
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
  const oauthKeys = keys.installed || keys.web;
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
  auth.setCredentials({ access_token: creds.access_token, refresh_token: creds.refresh_token });
  const sheets = google.sheets({ version: 'v4', auth });

  // Agrupa por planilha
  const bySheet = {};
  for (const { targets, value } of resultsMap) {
    if (value === null) continue;
    for (const { s, r, c } of targets) {
      if (!bySheet[s]) bySheet[s] = [];
      bySheet[s].push({ range: cellAddr(c, r), values: [[value]] });
    }
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

// ─── Main ─────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox']
  });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const resultsMap = [];

  console.log(`\n🔍 Iniciando coleta de ${TASKS.length} links únicos...\n`);

  for (let i = 0; i < TASKS.length; i++) {
    const task = TASKS[i];
    process.stdout.write(`[${i + 1}/${TASKS.length}] ${task.produto}... `);
    const value = await getCount(page, task.link);
    console.log(value !== null ? `→ ${value}` : '→ FALHOU');
    resultsMap.push({ targets: task.targets, value });
  }

  await browser.close();

  console.log('\n📊 Resumo da coleta:');
  TASKS.forEach((t, i) => {
    const v = resultsMap[i].value;
    console.log(`  ${t.produto}: ${v !== null ? v : '❌ falhou'}`);
  });

  console.log('\n💾 Gravando nas planilhas...');
  await writeResults(resultsMap);
  console.log('\n✅ Conferência concluída!');
})();
