const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');
const http = require('http');
const url = require('url');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

async function authenticate() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );

  // Gera URL de autorização
  const authUrl = auth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
  });

  console.log('Abra esta URL no navegador e autorize:');
  console.log(authUrl);

  // Inicia servidor local para capturar callback
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const code = parsedUrl.query.code;

    if (code) {
      try {
        const { tokens } = await auth.getToken(code);
        auth.setCredentials(tokens);

        // Salva novas credenciais
        fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));

        res.writeHead(200);
        res.end('✅ Autenticação bem-sucedida! Você pode fechar esta janela.');

        console.log('\n✅ Token renovado e salvo em:', CREDENTIALS_PATH);
        console.log(JSON.stringify(tokens, null, 2));

        server.close();
        process.exit(0);
      } catch (err) {
        console.error('Erro ao trocar código por token:', err);
        res.writeHead(400);
        res.end('❌ Erro na autenticação');
        server.close();
        process.exit(1);
      }
    } else {
      res.writeHead(400);
      res.end('Código de autorização não recebido');
      server.close();
      process.exit(1);
    }
  });

  server.listen(80, async () => {
    console.log('\n🔄 Aguardando callback em http://localhost ...');
    console.log('\n⏱️  Se a porta 80 estiver indisponível, cancele (Ctrl+C) e execute com privilégios de admin.');
  });
}

authenticate().catch(console.error);
