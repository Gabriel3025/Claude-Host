const { google } = require('googleapis');
const fs = require('fs');

const OAUTH_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/client_secret_478518182582-si2pebu40belka7d95psoori8g3jsdd2.apps.googleusercontent.com.json';

const oauth = JSON.parse(fs.readFileSync(OAUTH_PATH));
const { client_id, client_secret, redirect_uris } = oauth.installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

const scopes = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive'
];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});

console.log('\n🔗 ABRA ESTE LINK NO SEU NAVEGADOR:');
console.log('=' .repeat(60));
console.log(authUrl);
console.log('=' .repeat(60));
console.log('\n✅ Após autorizar, copie o CÓDIGO que aparecerá na URL');
