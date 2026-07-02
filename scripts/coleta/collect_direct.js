const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

console.log('📊 ACOMPANHAMENTO DE OFERTAS - DIA 7\n');

async function main() {
  try {
    // Autenticação
    const credentialsPath = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credenciais não encontradas: ${credentialsPath}`);
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
    auth.setCredentials({ access_token: credentials.access_token });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1FTwRqDTkDCuDH8KqCzrQhQ9f__VNuBv6BV0_KpRmNFU';

    // Ler dados da planilha
    console.log('1️⃣ Lendo dados da planilha...');
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Planilha1!A:P'
    });

    const rows = result.data.values || [];
    const pendentes = [];

    // Processar linhas (começando na linha 2, pulando header)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[0]) continue; // Pular linhas vazias

      const produto = row[0];
      const identificado = row[1];
      const diasPassados = parseInt(row[2]) || 0;
      const colValue = row[4]; // Coluna que indica o DIA
      const link = row[5];

      // Calcular DIA com base nos dias passados
      const agora = new Date('2026-06-15');
      const dataIdentificado = new Date(identificado);
      const diasDesdeIdentificacao = Math.floor((agora - dataIdentificado) / (1000 * 60 * 60 * 24));
      const diaAtual = diasDesdeIdentificacao + 1;

      if (diaAtual > 10) continue; // Ignorar produtos finalizados

      if (diaAtual === 7) {
        // Verificar se precisa preenchimento
        const colIdx = 6 + diaAtual; // G=6, H=7, I=8, ..., M=12 (DIA 7)
        const colDia = 12; // M
        const valorAtual = row[colIdx] ? String(row[colIdx]).trim() : '';
        const precisaPreenchimento = !valorAtual;

        if (precisaPreenchimento) {
          pendentes.push({
            rowIdx: i,
            colDia: colDia,
            produto: produto,
            identificado: identificado,
            diasPassados: diasDesdeIdentificacao,
            diaNome: `DIA ${diaAtual}`,
            link: link,
            valorAtual: valorAtual,
            precisaPreenchimento: true
          });
        }
      }
    }

    console.log(`✅ ${pendentes.length} produtos encontrados em DIA 7\n`);

    // Passo 2: Coletar dados via Playwright
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
            // Pode falhar
          }

          const valor = await page.evaluate(() => {
            const text = document.body.innerText;
            const match = text.match(/~(\d+)\s+(?:resultados|result)/i);
            return match ? parseInt(match[1]) : 0;
          });

          resultados.push({
            rowIdx: produto.rowIdx,
            colDia: produto.colDia,
            produto: produto.produto,
            valor: valor,
            sheetRow: produto.rowIdx + 1
          });

          console.log(`  ✅ ${valor}`);
        } catch (e) {
          console.log(`  ⚠️ 0`);
          resultados.push({
            rowIdx: produto.rowIdx,
            colDia: produto.colDia,
            produto: produto.produto,
            valor: 0,
            sheetRow: produto.rowIdx + 1
          });
        }
      }

      await browser.close();

      console.log('\n✅ COLETA CONCLUÍDA');
      console.log('='.repeat(60));

      const totalAnuncios = resultados.reduce((sum, r) => sum + r.valor, 0);
      console.log(`Total de produtos: ${resultados.length}`);
      console.log(`Total de anúncios: ${totalAnuncios}`);

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
