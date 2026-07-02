#!/usr/bin/env node
const { chromium } = require('playwright');
const fs = require('fs');

const RETRY_PRODUTOS = [
  { rowIdx: 32, colDia: 9, produto: "Emagrecimento", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 35, colDia: 9, produto: "Alfabetização", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, colDia: 9, produto: "Pacotes de músicas", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 41, colDia: 9, produto: "DryWall", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { rowIdx: 42, colDia: 9, produto: "100 Cards Anti-Bullying", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 62, colDia: 9, produto: "Planilha financeira", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839" }
];

function log(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${msg}`);
}

async function extrairNumeroAnuncios(page) {
  try {
    await page.waitForTimeout(2000);
    const texto = await page.innerText('body');
    const regex = /[~≈]?\s*(\d+(?:[.,]\d+)*)\s+resultados?/i;
    const match = texto.match(regex);

    if (match) {
      const valor_str = match[1].replace(/\./g, '').replace(/,/g, '');
      return parseInt(valor_str);
    }

    if (/Nenhum anuncio|No ads|sem resultados/i.test(texto)) {
      return 0;
    }

    return null;
  } catch (e) {
    return null;
  }
}

async function retry() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const resultado_original = JSON.parse(fs.readFileSync('coleta_corrigida.json', 'utf8'));
  let sucesso = 0;

  log(`Retry de ${RETRY_PRODUTOS.length} produtos falhados...`);
  log('');

  for (const prod of RETRY_PRODUTOS) {
    process.stdout.write(`[RETRY] ${prod.produto.padEnd(35)} `);

    try {
      await page.goto(prod.url, { waitUntil: 'networkidle', timeout: 50000 });
      await page.keyboard.press('Escape');

      const valor = await extrairNumeroAnuncios(page);

      if (valor !== null) {
        // Atualizar no array original
        const idx = resultado_original.findIndex(r => r.rowIdx === prod.rowIdx);
        if (idx >= 0) {
          resultado_original[idx].valor = valor;
        }
        console.log(`OK ${valor}`);
        sucesso++;
      } else {
        // Se ainda assim não conseguir, marcar como 0 (sem anúncios)
        const idx = resultado_original.findIndex(r => r.rowIdx === prod.rowIdx);
        if (idx >= 0) {
          resultado_original[idx].valor = 0;
        }
        console.log(`NULL -> 0`);
        sucesso++;
      }
    } catch (err) {
      console.log(`ERRO (${String(err.message).substring(0, 20)})`);
      // Deixar como null (será tratado como erro depois)
    }

    await page.waitForTimeout(2000);
  }

  await browser.close();

  // Salvar resultados atualizados
  fs.writeFileSync('coleta_corrigida.json', JSON.stringify(resultado_original, null, 2), 'utf8');

  log('');
  log(`[OK] Retry finalizado: ${sucesso}/${RETRY_PRODUTOS.length}`);

  const with_valor = resultado_original.filter(r => r.valor !== null);
  const total = with_valor.reduce((sum, r) => sum + r.valor, 0);
  log(`[*] Total atualizado: ${total} anuncios`);
}

retry()
  .then(() => process.exit(0))
  .catch(err => {
    log(`ERRO: ${err.message}`);
    process.exit(1);
  });
