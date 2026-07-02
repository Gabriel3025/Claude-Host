const fs = require('fs');
const creds = JSON.parse(fs.readFileSync('../.gdrive-server-credentials.json', 'utf-8'));

console.log('Token info:');
console.log('- Has access_token:', !!creds.access_token);
console.log('- Has refresh_token:', !!creds.refresh_token);
console.log('- Expiry:', new Date(creds.expiry_date).toISOString());
console.log('- Now:', new Date().toISOString());
console.log('- Expired?', Date.now() > creds.expiry_date);
