const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );
  auth.setCredentials(creds);

  const sheets = google.sheets({ version: 'v4', auth });

  // Carregar coleta
  const coleta = JSON.parse(fs.readFileSync('resultados_hoje.json', 'utf8'));
  const coletaMap = {};
  coleta.forEach(c => {
    coletaMap[c.rowIdx] = c.valor;
  });

  // Ler Acompanhamento Ofertas
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: ACOMP_ID,
    range: 'A1:H100',
  });

  const rows = res.data.values || [];
  const headers = rows[0];

  console.log('📋 Estrutura da planilha:');
  headers.forEach((h, i) => console.log(`  [${i}] ${h}`));

  // Identificar colunas
  const colProduto = 0;    // PRODUTO
  const colDia2 = 7;       // DIA 2

  const acompData = [];
  const radarData = [];

  // Processar linhas
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || !row[colProduto]) continue;

    const produto = row[colProduto];
    const dia2Value = row[colDia2] || '';

    // Se DIA 2 está vazio
    if (!dia2Value || dia2Value.trim() === '') {
      // Procurar o valor na coleta pelo nome do produto
      const coletado = coleta.find(c => c.produto === produto);

      if (coletado) {
        acompData.push({
          range: `H${i + 1}`,
          values: [[coletado.valor]],
        });

        radarData.push({
          range: `I${i + 1}`,
          values: [[coletado.valor]],
        });
      }
    }
  }

  console.log('\n✅ PASSO 4: Verificação PRÉ-GRAVAÇÃO');
  console.log(`  Total DIA 2 a gravar: ${acompData.length}`);
  console.log('  Colunas: H (Acomp) / I (Radar)');
  console.log('\n  Amostra (primeiros 3):');

  for (let i = 1; i < Math.min(4, rows.length); i++) {
    const row = rows[i];
    if (row && row[colProduto]) {
      const dia2Val = row[colDia2] || '';
      if (!dia2Val || dia2Val.trim() === '') {
        const coletado = coleta.find(c => c.produto === row[colProduto]);
        if (coletado) {
          console.log(`    Linha ${i + 1}: ${row[colProduto]} = ${coletado.valor}`);
        }
      }
    }
  }

  if (acompData.length > 0) {
    console.log('\n📝 Gravando...');

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: acompData,
      },
    });

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: RADAR_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: radarData,
      },
    });

    console.log(`✅ Acompanhamento Ofertas: ${acompData.length} células gravadas em H`);
    console.log(`✅ Radar de Ofertas: ${radarData.length} células gravadas em I`);
    console.log('\n🎉 Conferência DIA 2 CONCLUÍDA COM PRECISÃO!');
  } else {
    console.log('\n⚠️  Nenhum produto DIA 2 encontrado');
  }
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
