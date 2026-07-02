const https = require('https');
const fs = require('fs');
const querystring = require('querystring');

const OAUTH_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/client_secret_478518182582-si2pebu40belka7d95psoori8g3jsdd2.apps.googleusercontent.com.json';
const CREDS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const oauth = JSON.parse(fs.readFileSync(OAUTH_PATH));
const creds = JSON.parse(fs.readFileSync(CREDS_PATH));

const { client_id, client_secret } = oauth.installed;
const { refresh_token } = creds;

const postData = querystring.stringify({
  client_id,
  client_secret,
  refresh_token,
  grant_type: 'refresh_token'
});

const options = {
  hostname: 'oauth2.googleapis.com',
  path: '/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.error) {
        console.log('❌ Erro:', response.error);
        console.log('Detalhes:', response.error_description);
      } else {
        const newCreds = {
          ...response,
          refresh_token: response.refresh_token || refresh_token
        };
        fs.writeFileSync(CREDS_PATH, JSON.stringify(newCreds, null, 2));
        console.log('✅ Token renovado com sucesso!');
        console.log('Access Token:', response.access_token.substring(0, 30) + '...');
        console.log('Expires in:', response.expires_in, 'segundos');
      }
    } catch (e) {
      console.log('Erro ao parsear resposta:', e.message);
      console.log('Response:', data);
    }
  });
});

req.on('error', (e) => console.log('Erro na requisição:', e.message));
req.write(postData);
req.end();
