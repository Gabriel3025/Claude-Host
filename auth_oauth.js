const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');
const readline = require('readline');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );

  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('🔐 Abra este link no navegador para autenticar:');
  console.log('');
  console.log(authUrl);
  console.log('');
  console.log('Após autenticar, você será redirecionado para uma URL. Copie o código da URL (o parâmetro "code=...") e cole abaixo:');
  console.log('');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Cole o código aqui: ', async (code) => {
    try {
      const { tokens } = await auth.getToken(code);
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
      console.log('');
      console.log('✅ Credenciais salvas com sucesso!');
      console.log('Agora você pode executar: node read_sheet.js');
    } catch (err) {
      console.error('❌ Erro ao autenticar:', err.message);
    }
    rl.close();
  });
}

main().catch(console.error);
