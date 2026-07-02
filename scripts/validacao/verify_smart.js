const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

async function main() {
  try {
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

    // DIA 10 (coluna P): amostras
    // DIA 8 (coluna N): Potinho da fé (rowIdx 68 → N69)
    // DIA 7 (coluna M): Alfabetização (rowIdx 69 → M70)
    const amostras = [
      { cell: 'P2', desc: 'Atividade cursiva (DIA 10)' },
      { cell: 'P9', desc: 'Jiujistu (DIA 10)' },
      { cell: 'P32', desc: 'Moldes FOAM (DIA 10)' },
      { cell: 'N69', desc: 'Potinho da fé (DIA 8)' },
      { cell: 'M70', desc: 'Alfabetização (DIA 7)' },
    ];
    
    console.log('✅ Verificando células gravadas:');
    for (const amostra of amostras) {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: ACOMP_ID,
        range: amostra.cell,
      });

      const value = response.data.values?.[0]?.[0] || '(vazio)';
      console.log(`  ${amostra.cell} (${amostra.desc}): ${value}`);
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
