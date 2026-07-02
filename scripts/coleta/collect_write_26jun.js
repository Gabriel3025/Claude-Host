const puppeteer = require('puppeteer');
const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const produtos = [
  {
    rowIdx: 99,
    colDia: 10,
    produto: "A história do lider (Política)",
    diaNome: "DIA 10",
    link: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27476307511973173&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=984175081437878"
  },
];

function getColunaDIA(dia) {
  const cols = { 1:'G',2:'H',3:'I',4:'J',5:'K',6:'L',7:'M',8:'N',9:'O',10:'P' };
  return cols[dia];
}

async function getCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 1500));

    const text = await page.evaluate(() => document.body.innerText);
    const match = text.match(/[~≈]?\s*([\d.,]+)\s*resultado/i);
    if (match) {
      const num = parseInt(match[1].replace(/[.,]/g, ''), 10);
      return isNaN(num) ? 0 : num;
    }
    if (/Nenhum anúncio|No ads|nenhum resultado/i.test(text)) return 0;
    return null;
  } catch (e) {
    console.error('  Erro na coleta:', e.message.substring(0, 80));
    return null;
  }
}

async function main() {
  // ETAPA 1: Coletar via Puppeteer
  console.log('\n🔍 ETAPA 1 — Coleta via Puppeteer\n');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  const resultados = [];

  for (let i = 0; i < produtos.length; i++) {
    const p = produtos[i];
    process.stdout.write(`[${i+1}/${produtos.length}] ${p.produto} (${p.diaNome}) ... `);
    const valor = await getCount(page, p.link);
    const count = valor !== null ? valor : 0;
    resultados.push({ rowIdx: p.rowIdx, colDia: p.colDia, produto: p.produto, dia: p.colDia, count });
    console.log(valor !== null ? `${count} anúncios` : `NÃO ENCONTRADO (gravando 0)`);
  }

  await browser.close();
  console.log('\n✅ Coleta concluída!\n');

  // ETAPA 2: Gravar na planilha
  console.log('📤 ETAPA 2 — Gravando na planilha...\n');

  const writeData = resultados.map(r => {
    const sheetRow = r.rowIdx + 1;
    const coluna = getColunaDIA(r.dia);
    return { range: `${coluna}${sheetRow}`, value: r.count, produto: r.produto };
  });

  writeData.forEach(d => console.log(`   ${d.produto}: ${d.range} = ${d.value}`));

  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );
  auth.setCredentials(savedCredentials);

  const sheets = google.sheets({ version: 'v4', auth });

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: ACOMP_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: writeData.map(d => ({ range: d.range, values: [[d.value]] })),
    },
  });

  console.log(`\n✅ ${response.data.totalUpdatedCells} célula(s) gravada(s)!`);
  console.log('\n🎉 Acompanhamento 26/06/2026 concluído!');
  console.log(`   Produtos: ${resultados.length}`);
  resultados.forEach(r => {
    const col = getColunaDIA(r.dia);
    const row = r.rowIdx + 1;
    console.log(`   ✓ ${r.produto}: ${col}${row} = ${r.count} anúncios`);
  });
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
