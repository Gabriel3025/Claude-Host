const { google } = require('googleapis');
const fs = require('fs');

const credentialsPath = '../.gdrive-server-credentials.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

(async () => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);

  const sheets = google.sheets('v4');

  try {
    console.log('Lendo planilha Acompanhamento Ofertas...');

    const response = await sheets.spreadsheets.values.get({
      auth,
      spreadsheetId: '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg',
      range: 'A:G',
    });

    const rows = response.data.values || [];
    const products = [];

    console.log('Primeiras 3 linhas para debug:');
    for (let i = 0; i < 3; i++) {
      console.log(`Row ${i}:`, rows[i]);
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[0] && row[0].trim()) {
        products.push({
          rowIdx: i + 1,
          produto: row[0],
          col_C: row[2] || '',
          col_D: row[3] || '',
          col_E: row[4] || '',
          col_F: row[5] || '',
          col_G: row[6] || ''
        });
      }
    }

    fs.writeFileSync('all_products_debug.json', JSON.stringify(products.slice(0, 10), null, 2));
    console.log(`✅ ${products.length} produtos encontrados`);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
