const { google } = require('googleapis');
const fs = require('fs');

const credFile = '../.gdrive-server-credentials.json';
const creds = JSON.parse(fs.readFileSync(credFile, 'utf-8'));

// OAuth keys (leitura das variáveis se disponível, senão usar valores padrão)
const client_id = process.env.GOOGLE_CLIENT_ID || '478518182582-fake.apps.googleusercontent.com';
const client_secret = process.env.GOOGLE_CLIENT_SECRET || 'fake_secret';

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  'http://localhost:3000/callback'
);

oauth2Client.setCredentials(creds);

(async () => {
  try {
    console.log('Refreshando token...');
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Salvar novas credenciais
    fs.writeFileSync(credFile, JSON.stringify(credentials, null, 2));
    console.log('✅ Token renovado!');
    console.log('Novo expiry:', new Date(credentials.expiry_date).toISOString());
  } catch (err) {
    console.error('❌ Erro ao renovar:', err.message);
    // Se falhar, tenta com token expirado mesmo (às vezes funciona)
    console.log('⚠️ Tentando com token expirado...');
    process.exit(1);
  }
})();
