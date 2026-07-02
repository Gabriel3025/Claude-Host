const fs = require('fs');
const { google } = require('googleapis');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function authorize() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );

  auth.setCredentials(savedCredentials);
  return auth;
}

async function main() {
  try {
    const auth = authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    // Ler coleta_python.json
    const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));
    console.log(`[*] Lendo ${coleta.length} registros coletados...`);

    // Criar mapa rowIdx -> valor
    const coletaMap = {};
    coleta.forEach(item => {
      coletaMap[item.rowIdx] = item.valor;
    });

    // Montar dados para atualização
    // Linha 2 do sheet = rowIdx 1, linha 3 = rowIdx 2, etc.
    const updateData = [];
    for (let i = 1; i <= 67; i++) {
      if (coletaMap[i] !== undefined) {
        updateData.push({
          range: `G${i + 1}`,  // G2 para rowIdx 1, G3 para rowIdx 2, etc.
          majorDimension: 'ROWS',
          values: [[coletaMap[i]]]
        });
      }
    }

    console.log(`[*] ${updateData.length} células para atualizar`);

    if (updateData.length > 0) {
      const response = await sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
          data: updateData,
          valueInputOption: 'RAW'
        }
      });

      console.log(`[OK] ${response.data.updatedCells} células atualizadas`);
    }

    console.log('[OK] Conferência de Ofertas corrigida!');
  } catch (err) {
    console.error('ERRO:', err.message);
    process.exit(1);
  }
}

main();
