const { google } = require('googleapis');
const fs = require('fs');
const http = require('http');
const url = require('url');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

async function main() {
  // Remover credenciais antigas
  if (fs.existsSync(CREDENTIALS_PATH)) {
    fs.unlinkSync(CREDENTIALS_PATH);
    console.log('✓ Credenciais antigas removidas\n');
  }

  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const oauth2Client = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    'http://localhost:3000/oauth2callback'
  );

  const scopes = ['https://www.googleapis.com/auth/spreadsheets'];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  console.log('🔐 Abra este link no navegador:');
  console.log(authUrl);
  console.log('\n⏳ Aguardando autenticação...\n');

  // Criar servidor local para receber callback
  const server = http.createServer(async (req, res) => {
    const qs = url.parse(req.url, true).query;
    const code = qs.code;

    if (!code) {
      res.end('❌ Erro: código não recebido');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);
      fs.writeFileSync(CREDENTIALS_PATH, JSON.stringify(tokens, null, 2));

      res.end('✅ Autenticação bem-sucedida! Você pode fechar esta janela.');
      console.log('✅ Credenciais salvas com sucesso!');
      console.log('📋 Arquivo:', CREDENTIALS_PATH);
      console.log('\nAgora execute: node read_sheet_v2.js');

      server.close();
      process.exit(0);
    } catch (err) {
      res.end('❌ Erro ao processar token: ' + err.message);
      console.error('Erro:', err.message);
      server.close();
      process.exit(1);
    }
  });

  server.listen(3000, () => {
    console.log('Servidor aguardando callback em http://localhost:3000/oauth2callback\n');
  });
}

main().catch(console.error);
