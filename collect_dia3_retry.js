const { chromium } = require('playwright');
const fs = require('fs');

const resultado_anterior = JSON.parse(fs.readFileSync('scratch_resultado_dia3.json', 'utf-8'));
const falhas_anteriores = resultado_anterior.falhas;

console.log(`\n🔄 Reprocessando ${falhas_anteriores.length} produtos que falharam...\n`);

async function extractAdsCount(text) {
  const withAdsMatch = text.match(/~\s*(\d[\d.,]*)\s*resultados?/i);
  if (withAdsMatch) {
    return parseInt(withAdsMatch[1].replace(/[.,]/g, ''));
  }
  const noAdsMatch = text.match(/Nenhum anúncio corresponde aos seus critérios de pesquisa/i);
  if (noAdsMatch) {
    return 0;
  }
  return null;
}

async function retryFalhas() {
  let browser;
  const novos_resultados = [];
  const falhas_permanentes = [];

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ locale: 'pt-BR' });
    const page = await context.newPage();

    for (let i = 0; i < falhas_anteriores.length; i++) {
      const falha = falhas_anteriores[i];

      try {
        console.log(`[${i + 1}/${falhas_anteriores.length}] ${falha.produto}...`);

        await page.goto(falha.link, { waitUntil: 'load', timeout: 60000 });
        await page.waitForTimeout(3000);

        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);

        const pageText = await page.evaluate(() => document.body.innerText);
        const valor = await extractAdsCount(pageText);

        if (valor !== null) {
          novos_resultados.push({ rowIdx: falha.rowIdx, valor, produto: falha.produto });
          console.log(`   ✅ ${valor} anúncios`);
        } else {
          falhas_permanentes.push({ rowIdx: falha.rowIdx, produto: falha.produto, erro: 'Regex falhou' });
          console.log(`   ⚠️  Regex não encontrou`);
        }
      } catch (err) {
        falhas_permanentes.push({ rowIdx: falha.rowIdx, produto: falha.produto, erro: err.message.substring(0, 100) });
        console.log(`   ❌ ${err.message.substring(0, 50)}...`);
      }
    }

    await context.close();
    await browser.close();

    console.log(`\n✅ Retry concluído!`);
    console.log(`   Sucesso: ${novos_resultados.length}/${falhas_anteriores.length}`);
    console.log(`   Falhas permanentes: ${falhas_permanentes.length}`);

    const resultado_final = {
      resultados: [...resultado_anterior.resultados, ...novos_resultados],
      falhas: falhas_permanentes
    };

    fs.writeFileSync('scratch_resultado_dia3.json', JSON.stringify(resultado_final, null, 2));
    console.log(`\n📝 Resultado atualizado`);

  } catch (err) {
    console.error('Erro fatal:', err);
    process.exit(1);
  }
}

retryFalhas();
