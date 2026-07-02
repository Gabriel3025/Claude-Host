const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const PORT = 57586;
const REDIRECT_URI = `http://localhost:${PORT}`;

const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
const clientKeys = oauthKeys.installed || oauthKeys.web;

const oAuth2Client = new google.auth.OAuth2(
  clientKeys.client_id,
  clientKeys.client_secret,
  REDIRECT_URI
);

const scopes = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: scopes,
});

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/?')) {
    const url = new URL(req.url, REDIRECT_URI);
    const code = url.searchParams.get('code');
    if (code) {
      try {
        const { tokens } = await oAuth2Client.getToken(code);
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));
        res.end('Autenticacao concluida com sucesso! Pode fechar esta aba.');
        console.log('CREDENTIALS_SAVED_OK');
      } catch (e) {
        res.end('Erro ao trocar o codigo por token: ' + e.message);
        console.error('TOKEN_EXCHANGE_ERROR', e.message);
      }
      server.close();
      process.exit(0);
    }
  }
});

server.listen(PORT, () => {
  console.log('AUTH_URL: ' + authUrl);
  exec(`start "" "${authUrl}"`, (err) => {
    if (err) console.error('Nao consegui abrir o navegador automaticamente:', err.message);
  });
});

setTimeout(() => {
  console.error('TIMEOUT_NO_CALLBACK');
  process.exit(1);
}, 180000);
