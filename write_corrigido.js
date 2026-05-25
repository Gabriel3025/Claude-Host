const fs = require('fs');
const { google } = require('googleapis');
const { authenticate } = require('@google-cloud/local-auth');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const SPREADSHEET_ID = '1fxWE-WrYC8GVKvYWIq8FiNGG5jOW7K8fYfvP6YyYfow';

async function authorize() {
  let client;
  if (fs.existsSync(TOKEN_PATH)) {
    client = new google.auth.OAuth2Client();
    client.setCredentials(JSON.parse(fs.readFileSync(TOKEN_PATH)));
  } else {
    client = await authenticate({ scopes: SCOPES, keyfilePath: path.join(__dirname, 'credentials.json') });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(client.credentials));
  }
  return client;
}

async function limparDados(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  console.log('[*] Limpando dados incorretos da coluna G (DIA 1)...');

  // Limpar G2:G67 (48 linhas de produtos, começando da linha 2)
  const clearRequest = {
    spreadsheetId: SPREADSHEET_ID,
    range: 'Acompanhamento Ofertas!G2:G67',
  };

  await sheets.spreadsheets.values.clear(clearRequest);
  console.log('[OK] Dados da coluna G limpos');
}

async function escreverDados(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  // Ler coleta_python.json
  const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));

  console.log('[*] Preparando dados para escrita...');

  // Mapear dados para formato de escrita: [rowIdx -> valor]
  // O rowIdx já é a linha correta, mas precisa ser escrito em G[rowIdx]
  // Como as linhas começam em 1 (header), e o rowIdx começa em 1 (primeira linha de dados),
  // precisamos ajustar para o formato A1 do Sheets

  const requests = [];
  const coletaMap = {};

  // Criar mapa rowIdx -> valor
  coleta.forEach(item => {
    coletaMap[item.rowIdx] = item.valor;
  });

  console.log(`[*] ${coleta.length} produtos coletados`);
  console.log('[*] Preparando batchUpdate...');

  // Montar dados para atualização: cada linha precisa de A1:G67
  // Onde G2 é rowIdx 1, G3 é rowIdx 2, etc.

  // Forma alternativa: usar batchUpdate com setValue
  const updateData = [];
  for (let i = 1; i <= 67; i++) {
    if (coletaMap[i] !== undefined) {
      updateData.push({
        range: `Acompanhamento Ofertas!G${i + 1}`,
        majorDimension: 'ROWS',
        values: [[coletaMap[i]]]
      });
    }
  }

  console.log(`[*] ${updateData.length} células para atualizar`);

  if (updateData.length > 0) {
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: updateData,
        valueInputOption: 'RAW'
      }
    });
  }

  console.log('[OK] Dados escrito com sucesso');
}

async function main() {
  try {
    const auth = await authorize();
    await limparDados(auth);
    await escreverDados(auth);
    console.log('[OK] Conferência de Ofertas corrigida!');
  } catch (err) {
    console.error('ERRO:', err);
    process.exit(1);
  }
}

main();
