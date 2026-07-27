const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const resultados = JSON.parse(fs.readFileSync('scratch_resultados_dia5_2707.json', 'utf8'));

const COLUNA_DIA5 = 'K';

const acompanhamentoData = resultados.map(r => {
  const sheetRow = r.rowIdx + 1;
  return {
    range: `${COLUNA_DIA5}${sheetRow}`,
    value: r.valor,
    produto: r.produto,
  };
});

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

    const updateData = acompanhamentoData.map(d => ({
      range: d.range,
      values: [[d.value]],
    }));

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: updateData,
      },
    });

    console.log(`✅ Acompanhamento Ofertas DIA 5 (27/07/2026): ${acompanhamentoData.length} células gravadas`);
    acompanhamentoData.forEach(d => console.log(`   ${d.range} = ${d.value} (${d.produto})`));
  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
