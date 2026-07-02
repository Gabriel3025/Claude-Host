const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const fs = require('fs');
const { exec } = require('child_process');

const OAUTH_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/client_secret_478518182582-si2pebu40belka7d95psoori8g3jsdd2.apps.googleusercontent.com.json';
const CREDS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const oauth = JSON.parse(fs.readFileSync(OAUTH_PATH));
const { client_id, client_secret, redirect_uris } = oauth.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  'http://localhost:8888'
);

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  redirect_uri: 'http://localhost:8888'
});

let server;

const requestListener = (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  if (parsedUrl.pathname === '/' && parsedUrl.query.code) {
    const code = parsedUrl.query.code;
    console.log('✅ Código de autorização recebido!');
    
    oauth2Client.getToken(code, (err, tokens) => {
      if (err) {
        console.log('❌ Erro ao obter tokens:', err.message);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>❌ Erro na autenticação</h1><p>' + err.message + '</p>');
        server.close();
        process.exit(1);
      } else {
        fs.writeFileSync(CREDS_PATH, JSON.stringify(tokens, null, 2));
        console.log('✅ Tokens salvos com sucesso!');
        console.log('Access Token:', tokens.access_token.substring(0, 30) + '...');
        console.log('Refresh Token:', tokens.refresh_token?.substring(0, 30) + '...');
        
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(`
          <h1>✅ Autenticação Concluída!</h1>
          <p>Voltando ao programa...</p>
        `);
        
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 2000);
      }
    });
  } else {
    res.writeHead(404);
    res.end('Não encontrado');
  }
};

server = http.createServer(requestListener);
server.listen(8888, () => {
  console.log('🔐 Abrindo navegador para autenticação...\n');
  
  exec(`start ${authUrl}`, (err) => {
    if (err) {
      console.log('Não consegui abrir o navegador automaticamente.');
      console.log('Abra este link manualmente:');
      console.log(authUrl);
    }
  });
  
  console.log('📍 Aguardando autorização no navegador...');
});
