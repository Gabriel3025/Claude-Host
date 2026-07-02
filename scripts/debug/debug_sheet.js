const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

async function main() {
  try {
    const credentialsPath = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');
    console.log('Lendo credenciais de:', credentialsPath);

    if (!fs.existsSync(credentialsPath)) {
      console.error('Arquivo não encontrado!');
      process.exit(1);
    }

    const credContent = fs.readFileSync(credentialsPath, 'utf-8');
    console.log('Conteúdo das credenciais:', credContent.substring(0, 100));

    const credentials = JSON.parse(credContent);
    console.log('Credenciais parseadas. Chaves:', Object.keys(credentials));
    const auth = new google.auth.OAuth2(
      credentials.client_id,
      credentials.client_secret,
      credentials.redirect_uris[0]
    );
    auth.setCredentials({ access_token: credentials.access_token });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = '1FTwRqDTkDCuDH8KqCzrQhQ9f__VNuBv6BV0_KpRmNFU';

    // Listar abas da planilha
    console.log('Obtendo informações da planilha...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    console.log('Estrutura recebida:', Object.keys(spreadsheet));

    if (!spreadsheet.data || !spreadsheet.data.sheets) {
      console.log('Resposta completa:', JSON.stringify(spreadsheet.data, null, 2));
      throw new Error('Estrutura inesperada');
    }

    console.log('Abas disponíveis:');
    spreadsheet.data.sheets.forEach(sheet => {
      console.log(`  - ${sheet.properties.title} (ID: ${sheet.properties.sheetId})`);
    });

    // Tentar ler com o nome correto da aba
    const abaName = spreadsheet.data.sheets[0].properties.title;
    console.log(`\nTentando ler aba: ${abaName}`);

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${abaName}!A1:P5`  // Ler primeiras 5 linhas
    });

    console.log('\nResposta da API:');
    console.log(JSON.stringify(result.data, null, 2));

  } catch (e) {
    console.error('Erro:', e.message);
  }
}

main();
