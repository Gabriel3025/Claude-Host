const { chromium } = require('playwright');
const fs = require('fs');

// Todos os 59 produtos de DIA 9
const PENDING = [
  { rowIdx: 1, produto: 'Tarot' },
  { rowIdx: 8, produto: 'Como plantar' },
  { rowIdx: 12, produto: 'Neuropro' },
  { rowIdx: 20, produto: 'Airfryer' },
  { rowIdx: 30, produto: 'Saude (Euro)' },
  { rowIdx: 32, produto: 'Emagrecimento' },
  { rowIdx: 33, produto: 'Atividade cursiva' },
  { rowIdx: 34, produto: 'Jiujistu' },
  { rowIdx: 39, produto: '100 Brincadeiras Bebês' },
  { rowIdx: 40, produto: 'Organização do Lar' },
  { rowIdx: 42, produto: '100 Cards Anti-Bullying' },
  { rowIdx: 43, produto: 'Planilha Capivarinha' },
  { rowIdx: 44, produto: 'JiuJistsu (LATAM)' },
  { rowIdx: 52, produto: 'Atividades Copa do mundo' },
  { rowIdx: 53, produto: 'Calistenia asiática' },
  { rowIdx: 56, produto: 'Hora da Leiturinha' },
  { rowIdx: 58, produto: 'Cafajeste (Acompanhar OF)' },
  { rowIdx: 60, produto: 'Painel Campeões' },
  { rowIdx: 61, produto: 'Dinamicas aulas de PTBR' },
  { rowIdx: 62, produto: 'Planilha financeira' },
  { rowIdx: 63, produto: 'Atividades da Pro' },
  { rowIdx: 64, produto: 'Calistenia asiática 2' },
  { rowIdx: 65, produto: 'Atividades de português' },
  { rowIdx: 66, produto: 'Atividades em segundos' },
  { rowIdx: 67, produto: 'Figurinhaa do filho' },
  { rowIdx: 68, produto: 'Potinho da fé' },
  { rowIdx: 69, produto: 'Alfabetização' },
  { rowIdx: 70, produto: 'ABA no Autismo' },
  { rowIdx: 71, produto: 'KIT de costura (Acomapnhar)' },
  { rowIdx: 72, produto: 'Baralho do coração aberto' },
  { rowIdx: 73, produto: 'Jogo da Memória da Copa' },
  { rowIdx: 74, produto: 'Colorir Copa do Mundo' },
  { rowIdx: 75, produto: 'Artes para Terraplanagem' },
  { rowIdx: 76, produto: 'Logo' },
  { rowIdx: 77, produto: 'TDAH' },
  { rowIdx: 78, produto: 'Segredo do bebe' },
  { rowIdx: 79, produto: '80 recursos terapeuticos' },
  { rowIdx: 80, produto: 'Acelerar aprendizado da cria' },
  { rowIdx: 81, produto: 'Quadro com versículos' },
  { rowIdx: 82, produto: 'Bolsas Croche' },
  { rowIdx: 83, produto: 'Hora de aprender cristão' },
  { rowIdx: 84, produto: 'Materiais para professores' },
  { rowIdx: 85, produto: 'Pack Figurinhas' },
  { rowIdx: 86, produto: 'Pack Figurinhas Copa' },
  { rowIdx: 87, produto: 'Exercícios para TDAH' },
  { rowIdx: 88, produto: 'Molde Roupa PET' },
  { rowIdx: 89, produto: 'Cristão + Hidroponica' },
  { rowIdx: 90, produto: 'TCC com IA (R$ 297,00)' },
  { rowIdx: 91, produto: 'Catalogo Estética automotiva' },
  { rowIdx: 92, produto: 'Atividades para idosos' },
  { rowIdx: 93, produto: 'Atividades para copa' },
  { rowIdx: 94, produto: 'Adesivo Sono' },
  { rowIdx: 95, produto: 'Simulado CNH' },
  { rowIdx: 96, produto: 'Matemática Minecraft' },
  { rowIdx: 97, produto: 'Desafio 21 dias Emagrec.' },
  { rowIdx: 98, produto: 'Brinquedos de Papel' },
  { rowIdx: 99, produto: 'A história do lider (Política)' },
  { rowIdx: 100, produto: 'Dor na coluna (Acompanhar)' },
  { rowIdx: 101, produto: 'Bolsas de Crochê' }
];

// Ler links do arquivo anterior
let links = {};
try {
  const sheet_output = fs.readFileSync('sheet_check.txt', 'utf8');
  const linkMatches = sheet_output.match(/"rowIdx":\s*(\d+)[\s\S]*?"link":\s*"([^"]+)"/g);
  if (linkMatches) {
    linkMatches.forEach(match => {
      const [, rowIdx, link] = match.match(/"rowIdx":\s*(\d+)[\s\S]*?"link":\s*"([^"]+)"/);
      links[parseInt(rowIdx)] = link;
    });
  }
} catch (e) {
  console.warn('⚠️  Não conseguiu ler links do arquivo anterior');
}

async function extractAdCount(page, link) {
  try {
    await page.goto(link, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2500);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const text = await page.evaluate(() => document.body.innerText);
    const matchResults = text.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
    if (matchResults) return parseInt(matchResults[1].replace(/\D/g, ''), 10);
    if (text.includes('Nenhum anúncio corresponde')) return 0;
    return null;
  } catch (err) {
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: 'pt-BR' });
  const page = await context.newPage();

  const results = [];

  console.log(`📊 Coletando ${PENDING.length} produtos para DIA 9...\n`);

  for (let i = 0; i < PENDING.length; i++) {
    const p = PENDING[i];
    const link = links[p.rowIdx];

    if (!link) {
      console.log(`[${i + 1}/${PENDING.length}] ${p.produto}... ⚠️  SEM LINK`);
      continue;
    }

    process.stdout.write(`[${i + 1}/${PENDING.length}] ${p.produto}...`);

    const valor = await extractAdCount(page, link);
    if (valor !== null) {
      results.push({ rowIdx: p.rowIdx, colDia: 14, produto: p.produto, valor });
      console.log(` ✅ ${valor}`);
    } else {
      console.log(' ⚠️');
    }
  }

  await browser.close();

  console.log(`\n✅ Coletados: ${results.length}/${PENDING.length}`);
  fs.writeFileSync('results_dia9.json', JSON.stringify(results, null, 2));
  console.log('Salvos em: results_dia9.json');
}

main().catch(console.error);
