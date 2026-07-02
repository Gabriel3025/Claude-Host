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

  // Criar mapa de Nome → Valor
  const coletaMap = {};
  coleta.forEach(c => {
    coletaMap[c.produto] = c.valor;
  });

  console.log('📊 Mapa de coleta criado com ' + coleta.length + ' produtos');

  // Ler planilha
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: ACOMP_ID,
    range: 'A2:H100',
  });

  const rows = res.data.values || [];
  const acompData = [];
  const radarData = [];

  console.log('\n✅ PASSO 4: Gravação DIA 2 (matching por nome)');
  console.log('  Amostra de matching:');

  rows.forEach((row, idx) => {
    if (!row || !row[0]) return;

    const produto = row[0];
    const valor = coletaMap[produto];

    if (valor !== undefined) {
      const lineNum = idx + 2; // +2 porque começa em 2 (header + offset)

      acompData.push({
        range: `H${lineNum}`,
        values: [[valor]],
      });

      radarData.push({
        range: `I${lineNum}`,
        values: [[valor]],
      });

      if (acompData.length <= 3) {
        console.log(`    ${produto} = ${valor} (linha ${lineNum})`);
      }
    }
  });

  console.log(`\n  Total a gravar: ${acompData.length}`);

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

    console.log(`✅ Acompanhamento Ofertas: ${acompData.length} células gravadas em H (DIA 2)`);
    console.log(`✅ Radar de Ofertas: ${radarData.length} células gravadas em I (DIA 2)`);
    console.log('\n🎉 Conferência DIA 2 CONCLUÍDA COM NÚMEROS CORRETOS!');
  }
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
