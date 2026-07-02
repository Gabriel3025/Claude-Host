const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const OAUTH_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/client_secret_478518182582-si2pebu40belka7d95psoori8g3jsdd2.apps.googleusercontent.com.json';
const CREDS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const oauth = JSON.parse(fs.readFileSync(OAUTH_PATH));
const { client_id, client_secret, redirect_uris } = oauth.installed;

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

// Tentar usar token salvo
try {
  const savedCreds = JSON.parse(fs.readFileSync(CREDS_PATH));
  oauth2Client.setCredentials(savedCreds);
  console.log('✓ Credenciais carregadas do arquivo');
  
  // Tentar refreshar
  oauth2Client.refreshAccessToken((err, tokens) => {
    if (err) {
      console.log('Token expirado, precisa reautenticar');
      console.log('ERROR:', err.message);
    } else {
      fs.writeFileSync(CREDS_PATH, JSON.stringify(tokens));
      console.log('✓ Token renovado com sucesso!');
      process.exit(0);
    }
  });
} catch (err) {
  console.log('Erro ao carregar credenciais:', err.message);
}
