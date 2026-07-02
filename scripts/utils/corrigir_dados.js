const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

const resultados = JSON.parse(fs.readFileSync('resultados_hoje.json', 'utf8'));

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

    // 1. Apagar dados antigos (DIA 5 = colunas K e L)
    console.log('🗑️  Apagando dados antigos (DIA 5)...');

    const clearRequests = [
      {
        spreadsheetId: ACOMP_ID,
        range: 'K2:K71',
      },
      {
        spreadsheetId: ACOMP_ID,
        range: 'L2:L71',
      },
      {
        spreadsheetId: RADAR_ID,
        range: 'K2:K71',
      },
      {
        spreadsheetId: RADAR_ID,
        range: 'L2:L71',
      },
    ];

    for (const req of clearRequests) {
      await sheets.spreadsheets.values.clear({
        spreadsheetId: req.spreadsheetId,
        range: req.range,
      });
    }
    console.log('✅ Dados antigos apagados');

    // 2. Gravar dados corretos em DIA 1 (colunas G e H)
    console.log('\n📝 Gravando dados corretos em DIA 1...');

    const acompanhamentoData = resultados.map(r => ({
      range: `G${r.rowIdx + 1}`,
      values: [[r.valor]],
    }));

    const radarData = resultados.map(r => ({
      range: `H${r.rowIdx + 1}`,
      values: [[r.valor]],
    }));

    // Gravar Acompanhamento Ofertas
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: ACOMP_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: acompanhamentoData,
      },
    });
    console.log(`✅ Acompanhamento Ofertas: ${acompanhamentoData.length} células gravadas em G/H`);

    // Gravar Radar de Ofertas
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: RADAR_ID,
      requestBody: {
        valueInputOption: 'RAW',
        data: radarData,
      },
    });
    console.log(`✅ Radar de Ofertas: ${radarData.length} células gravadas em G/H`);

    console.log('\n🎉 Correção concluída!');
    console.log(`   Total de produtos: ${resultados.length}`);
    console.log(`   Dados movidos de DIA 5 (K/L) para DIA 1 (G/H)`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
    process.exit(1);
  }
}

main();
