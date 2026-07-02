const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

// Função para obter coluna letra a partir do DIA
function getColunaDIA(dia) {
  const colunas = {
    1: 'G', 2: 'H', 3: 'I', 4: 'J', 5: 'K',
    6: 'L', 7: 'M', 8: 'N', 9: 'O', 10: 'P'
  };
  return colunas[dia] || null;
}

// Ler resultados coletados
const resultadosPath = path.join(__dirname, 'resultados_dia5.json');
if (!fs.existsSync(resultadosPath)) {
  console.error('❌ Arquivo resultados_dia5.json não encontrado');
  process.exit(1);
}

const resultados = JSON.parse(fs.readFileSync(resultadosPath, 'utf-8'));

console.log('\n📝 GRAVANDO RESULTADOS - DIA 5');
console.log('='.repeat(60));
console.log(`Total de produtos: ${resultados.length}`);

// Preparar dados para gravação
const dadosGravacao = resultados.map(r => ({
  range: `${getColunaDIA(5)}${r.sheetRow}`,  // K2, K9, etc
  value: r.valor
}));

console.log('\nMapeamento para gravação:');
dadosGravacao.forEach((d, idx) => {
  console.log(`  ${idx + 1}. ${d.range} = ${resultados[idx].valor} (${resultados[idx].produto})`);
});

// Autenticação OAuth2
async function gravar() {
  try {
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

    // Validação final antes de gravar
    console.log('\n⚠️ VALIDAÇÃO PRÉ-GRAVAÇÃO:');
    let totalValores = 0;
    let erroValidacao = false;

    resultados.forEach((r, idx) => {
      if (r.valor === undefined || r.valor === null) {
        console.log(`  ❌ Produto ${r.produto}: valor indefinido`);
        erroValidacao = true;
      } else {
        totalValores += r.valor;
      }
      console.log(`  ✓ ${r.produto}: ${r.valor}`);
    });

    if (erroValidacao) {
      console.log('\n❌ Erros de validação detectados. Abortando gravação.');
      process.exit(1);
    }

    console.log(`\n✅ Validação OK - Total: ${totalValores} anúncios`);

    // Gravar cada célula
    console.log('\n📤 Gravando na planilha...');
    for (let i = 0; i < dadosGravacao.length; i++) {
      const dado = dadosGravacao[i];
      const resultado = resultados[i];

      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: dado.range,
          valueInputOption: 'RAW',
          resource: { values: [[dado.value]] }
        });
        console.log(`  ✓ ${dado.range} = ${dado.value} (${resultado.produto})`);
      } catch (e) {
        console.log(`  ❌ Erro ao gravar ${dado.range}: ${e.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ GRAVAÇÃO CONCLUÍDA');
    console.log(`Total de células gravadas: ${dadosGravacao.length}`);
    console.log(`Total de anúncios: ${totalValores}`);
    console.log('='.repeat(60) + '\n');

  } catch (e) {
    console.error('\n❌ Erro na autenticação ou gravação:', e.message);
    process.exit(1);
  }
}

// Executar
gravar();
