const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');
const http = require('http');
const url = require('url');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    'http://localhost:3000/oauth2callback'
  );

  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });

  console.log('\n🔗 Abra este link no navegador:\n');
  console.log(authUrl);
  console.log('\nAguardando autenticação em http://localhost:3000/oauth2callback ...\n');

  await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const parsed = url.parse(req.url, true);
      if (parsed.pathname === '/oauth2callback') {
        const code = parsed.query.code;
        try {
          const { tokens } = await auth.getToken(code);
          fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
          res.end('<h1>✅ Autenticado! Pode fechar esta aba.</h1>');
          console.log('✅ Credenciais salvas em:', CREDENTIALS_PATH);
          server.close();
          resolve();
        } catch (err) {
          res.end('<h1>Erro: ' + err.message + '</h1>');
          reject(err);
        }
      }
    });
    server.listen(3000);
  });
}

main().catch(console.error);
