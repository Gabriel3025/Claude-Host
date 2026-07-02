const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function getColunaDIA(dia) {
  const colByDia = {
    1: 'G',
    2: 'H',
    3: 'I',
    4: 'J',
    5: 'K',
    6: 'L',
    7: 'M',
    8: 'N',
    9: 'O',
    10: 'P',
  };
  return colByDia[dia];
}

async function main() {
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

  // Ler resultados coletados
  const resultados = JSON.parse(fs.readFileSync('resultados.json', 'utf8'));

  // Preparar dados para gravação
  const updateData = [];

  console.log('\n📝 Preparando para gravar resultados:');
  console.log('═'.repeat(70));

  let totalAnuncios = 0;

  resultados.forEach((r, idx) => {
    const sheetRow = r.rowIdx + 1; // Converter para 1-indexed
    const dia = r.colDia - 5; // Converter colDia 0-indexed para DIA
    const coluna = getColunaDIA(dia);
    const range = `${coluna}${sheetRow}`;

    updateData.push({
      range,
      values: [[r.valor]],
    });

    console.log(`[${idx + 1}/${resultados.length}] ${r.produto.padEnd(35)} → ${range} = ${r.valor}`);
    totalAnuncios += parseInt(r.valor) || 0;
  });

  console.log('═'.repeat(70));
  console.log(`✅ Total: ${resultados.length} produtos | ${totalAnuncios} anúncios`);

  // Gravar via API
  console.log('\n⏳ Gravando na planilha...');

  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: updateData,
        valueInputOption: 'RAW',
      },
    });

    console.log(`✅ Gravação concluída! ${response.data.updatedCells} células atualizadas.`);
  } catch (e) {
    console.error(`❌ Erro ao gravar: ${e.message}`);
    process.exit(1);
  }
}

main();
