#!/usr/bin/env node
/**
 * COLETA CORRIGIDA — Acompanhamento de Ofertas
 * Coleta EXATAMENTE os 44 produtos pendentes com colunas corretas
 * DIA 4 (col 9) + DIA 2 (col 7)
 * Item-por-item via Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');

// Produtos DIA 4 (colDia: 9)
const PRODUTOS_DIA4 = [
  { rowIdx: 1, colDia: 9, produto: "Tarot", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=332302629966050" },
  { rowIdx: 8, colDia: 9, produto: "Como plantar", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=agroescola.blog.br&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 12, colDia: 9, produto: "Neuropro", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=137915816063469" },
  { rowIdx: 20, colDia: 9, produto: "Airfryer", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=568879309640604" },
  { rowIdx: 30, colDia: 9, produto: "Saude (Euro)", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=985969307931107" },
  { rowIdx: 32, colDia: 9, produto: "Emagrecimento", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=370127649521306" },
  { rowIdx: 33, colDia: 9, produto: "Atividade cursiva", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1259020229407188&view_all_page_id=100560129589941&search_type=page&media_type=all" },
  { rowIdx: 34, colDia: 9, produto: "Jiujistu", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=dinamicasjiujitsu.netlify.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 35, colDia: 9, produto: "Alfabetização", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&q=v0-pacotedeatividades2.vercel.app&search_type=keyword_unordered&sort_data[mode]=total_impressions&sort_data[direction]=desc" },
  { rowIdx: 36, colDia: 9, produto: "Pacotes de músicas", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=840327012401314&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=471645392708038" },
  { rowIdx: 39, colDia: 9, produto: "100 Brincadeiras Bebês", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&is_targeted_country=false&media_type=all&q=Espa%C3%A7o%20Compartilhando%20Saberes&search_type=keyword_unordered&sort_data[direction]=desc&sort_data[mode]=total_impressions&source=fb-logo" },
  { rowIdx: 40, colDia: 9, produto: "Organização do Lar", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=4306298432934563&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=323957035217343" },
  { rowIdx: 41, colDia: 9, produto: "DryWall", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=106015925221593" },
  { rowIdx: 42, colDia: 9, produto: "100 Cards Anti-Bullying", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1566627487729300&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=620103851191814" },
  { rowIdx: 43, colDia: 9, produto: "Planilha Capivarinha", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103914724705901" },
  { rowIdx: 44, colDia: 9, produto: "JiuJistsu (LATAM)", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1014540858412585" },
  { rowIdx: 52, colDia: 9, produto: "Atividades Copa do mundo", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104124204625179" },
  { rowIdx: 53, colDia: 9, produto: "Calistenia asiática", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 56, colDia: 9, produto: "Hora da Leiturinha", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=505480929317347" },
  { rowIdx: 58, colDia: 9, produto: "Cafajeste (Acompanhar OF)", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=348265368374848" },
  { rowIdx: 60, colDia: 9, produto: "Painel Campeões", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 61, colDia: 9, produto: "Dinamicas aulas de PTBR", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079543025232215" },
  { rowIdx: 62, colDia: 9, produto: "Planilha financeira", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=721380667735839" },
  { rowIdx: 63, colDia: 9, produto: "Atividades da Pro", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=366031383255150" },
  { rowIdx: 64, colDia: 9, produto: "Calistenia asiática 2 ", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=634382966425687" },
  { rowIdx: 65, colDia: 9, produto: "Atividades de português", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=109797355340410" },
  { rowIdx: 66, colDia: 9, produto: "Atividades em segundos", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=264978283375190" },
  { rowIdx: 67, colDia: 9, produto: "Figurinhaa do filho", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=667848806422877" },
  { rowIdx: 68, colDia: 9, produto: "Potinho da fé", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1053098841226167" },
  { rowIdx: 69, colDia: 9, produto: "Alfabetização", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=531839286685764" },
  { rowIdx: 70, colDia: 9, produto: "ABA no Autismo", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=2355407888026229" },
  { rowIdx: 71, colDia: 9, produto: "KIT de costura (Acomapnhar)", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=103027082609605" },
  { rowIdx: 72, colDia: 9, produto: "Baralho do coração aberto", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1009496725582636" },
  { rowIdx: 73, colDia: 9, produto: "Jogo da Memória da Copa", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&id=1329141256012536&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1041598825693538" }
];

// Produtos DIA 2 (colDia: 7)
const PRODUTOS_DIA2 = [
  { rowIdx: 74, colDia: 7, produto: "Colorir Copa do Mundo", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1920654611973945&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1108292285704598" },
  { rowIdx: 75, colDia: 7, produto: "Artes para Terraplanagem", url: "https://www.facebook.com/ads/library/?id=711781368658553" },
  { rowIdx: 76, colDia: 7, produto: "Logo", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2146722662816707&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=277295208806442" },
  { rowIdx: 77, colDia: 7, produto: "TDAH", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1314783087281541&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=363096403554825" },
  { rowIdx: 78, colDia: 7, produto: "Segredo do bebe", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1895457088077461&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=104281642605477" },
  { rowIdx: 79, colDia: 7, produto: "80 recursos terapeuticos", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2014856769454001&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=456601417538756" },
  { rowIdx: 80, colDia: 7, produto: "Acelerar aprendizado da cria", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2419112398599913&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=1079576205235125" },
  { rowIdx: 81, colDia: 7, produto: "Quadro com versículos", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=1455818499565681&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=160646760811963" },
  { rowIdx: 82, colDia: 7, produto: "Bolsas Croche", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=27233702462890933&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=938589105997445" },
  { rowIdx: 83, colDia: 7, produto: "Hora de aprender cristão", url: "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&id=2113158056291301&is_targeted_country=false&media_type=all&search_type=page&sort_data[mode]=total_impressions&sort_data[direction]=desc&view_all_page_id=119250001264774" }
];

const TODOS = [...PRODUTOS_DIA4, ...PRODUTOS_DIA2];

function log(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${msg}`);
}

async function extrairNumeroAnuncios(page) {
  try {
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

async function coletar() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const resultados = [];
  let sucesso = 0;
  let erros = 0;

  log(`Iniciando coleta de ${TODOS.length} produtos...`);
  log('');

  for (let i = 0; i < TODOS.length; i++) {
    const prod = TODOS[i];
    process.stdout.write(`[${String(i + 1).padStart(2, ' ')}/${TODOS.length}] ${prod.produto.padEnd(35)} `);

    try {
      await page.goto(prod.url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1500);

      const valor = await extrairNumeroAnuncios(page);

      if (valor === null) {
        throw new Error('Nao conseguiu extrair numero');
      }

      if (valor < 0 || valor > 2000) {
        throw new Error(`Valor invalido: ${valor}`);
      }

      resultados.push({
        rowIdx: prod.rowIdx,
        colDia: prod.colDia,
        valor: valor,
        produto: prod.produto
      });

      console.log(`OK ${valor}`);
      sucesso++;
    } catch (err) {
      console.log(`ERRO (${String(err.message).substring(0, 25)})`);
      erros++;
      resultados.push({
        rowIdx: prod.rowIdx,
        colDia: prod.colDia,
        valor: null,
        produto: prod.produto
      });
    }

    // Aguardar entre requisições
    if ((i + 1) % 15 === 0) {
      await page.waitForTimeout(4000);
    }
  }

  await browser.close();

  // Salvar resultados
  fs.writeFileSync('coleta_corrigida.json', JSON.stringify(resultados, null, 2), 'utf8');

  log('');
  log(`[OK] Coleta finalizada: ${sucesso}/${TODOS.length} produtos`);

  if (erros > 0) {
    log(`[!] ${erros} erros durante coleta`);
  }

  const with_valor = resultados.filter(r => r.valor !== null);
  const total_anuncios = with_valor.reduce((sum, r) => sum + r.valor, 0);

  log(`[*] Total de anuncios: ${total_anuncios}`);
  log(`[*] Arquivo salvo: coleta_corrigida.json`);
  log('');

  return sucesso === TODOS.length;
}

coletar()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    log(`ERRO FATAL: ${err.message}`);
    process.exit(1);
  });
