const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

async function main() {
  try {
    // Autenticação com as credenciais corretas
    const gcpPath = path.join(process.env.USERPROFILE, 'Downloads', 'gcp-oauth.keys.json');
    const tokenPath = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');

    const gcpContent = JSON.parse(fs.readFileSync(gcpPath, 'utf-8'));
    const tokenContent = JSON.parse(fs.readFileSync(tokenPath, 'utf-8'));

    const { client_id, client_secret, redirect_uris } = gcpContent.installed;

    const auth = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    auth.setCredentials({
      access_token: tokenContent.access_token,
      refresh_token: tokenContent.refresh_token,
      expiry_date: tokenContent.expiry_date
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

    // Ler dados da planilha
    console.log('1️⃣ Lendo dados da planilha...');
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Página1!A:P'
    });

    const rows = result.data.values || [];
    const pendentes = [];

    // Processar linhas
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue;

      const produto = row[0];
      const identificado = row[1];
      const link = row[5];

      // Calcular dias passados
      try {
        const dataIdentificado = new Date(identificado);
        const agora = new Date('2026-06-15');
        const diasPassados = Math.floor((agora - dataIdentificado) / (1000 * 60 * 60 * 24));
        const diaAtual = diasPassados + 1;

        if (diaAtual > 10) continue;
        if (diaAtual !== 7) continue;

        // Coluna M é colIdx 12 (0-based)
        const valorAtual = row[12] ? String(row[12]).trim() : '';
        const precisaPreenchimento = !valorAtual && link;

        if (precisaPreenchimento) {
          pendentes.push({
            rowIdx: i,
            colDia: 12, // M
            produto: produto,
            link: link,
            sheetRow: i + 1
          });
        }
      } catch (e) {
        // Pular linhas com erro de data
      }
    }

    console.log(`✅ ${pendentes.length} produtos encontrados em DIA 7\n`);

    if (pendentes.length === 0) {
      console.log('⏭️  Nenhum produto para processar');
      process.exit(0);
    }

    // Coletar dados via Playwright
    const { chromium } = require('playwright');
    const resultados = [];
    let browser;

    try {
      browser = await chromium.launch({ headless: true });
      const context = await browser.createContext();
      const page = await context.newPage();

      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      console.log('2️⃣ Coletando dados via Playwright...\n');

      for (let i = 0; i < pendentes.length; i++) {
        const produto = pendentes[i];
        const num = i + 1;
        process.stdout.write(`[${num}/${pendentes.length}] ${produto.produto.padEnd(35)}`);

        try {
          await page.goto(produto.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(2000);

          try {
            await page.press('Escape');
            await page.waitForTimeout(500);
          } catch (e) {
            // Ok falhar
          }

          const valor = await page.evaluate(() => {
            const text = document.body.innerText;
            const match = text.match(/~(\d+)\s+(?:resultados|result)/i);
            return match ? parseInt(match[1]) : 0;
          });

          resultados.push({
            rowIdx: produto.rowIdx,
            sheetRow: produto.sheetRow,
            colDia: produto.colDia,
            produto: produto.produto,
            valor: valor
          });

          console.log(`  ✅ ${valor}`);
        } catch (e) {
          console.log(`  ⚠️ 0`);
          resultados.push({
            rowIdx: produto.rowIdx,
            sheetRow: produto.sheetRow,
            colDia: produto.colDia,
            produto: produto.produto,
            valor: 0
          });
        }
      }

      await browser.close();

      console.log('\n✅ COLETA CONCLUÍDA');
      console.log('='.repeat(60));

      const totalAnuncios = resultados.reduce((sum, r) => sum + r.valor, 0);
      console.log(`Total de produtos: ${resultados.length}`);
      console.log(`Total de anúncios: ${totalAnuncios}`);

      // Salvar resultados
      fs.writeFileSync(
        path.join(__dirname, 'resultados_dia7.json'),
        JSON.stringify(resultados, null, 2)
      );

      console.log('\n📁 Resultados salvos em: resultados_dia7.json');
      console.log('='.repeat(60) + '\n');
      console.log('📝 PRÓXIMO PASSO: node write_dia7_correto.js\n');

    } catch (e) {
      if (browser) await browser.close();
      throw e;
    }

  } catch (e) {
    console.error('\n❌ Erro:', e.message);
    process.exit(1);
  }
}

main();
