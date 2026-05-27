const { google } = require('googleapis');
const fs = require('fs');

const credentialsPath = '../.gdrive-server-credentials.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

(async () => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);

  const sheets = google.sheets('v4');

  try {
    console.log('Lendo planilha com hyperlinks...');

    const response = await sheets.spreadsheets.get({
      auth,
      spreadsheetId: '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg',
      ranges: ['A:G'],
      includeGridData: true,
      fields: 'sheets(data(rowData(values(hyperlink,userEnteredValue))))'
    });

    const sheet = response.data.sheets[0];
    const gridData = sheet.data[0];
    const products = [];

    if (gridData && gridData.rowData) {
      for (let i = 1; i < gridData.rowData.length; i++) {
        const row = gridData.rowData[i];
        if (row.values && row.values[0] && row.values[0].userEnteredValue) {
          const produto = row.values[0].userEnteredValue.stringValue || row.values[0].userEnteredValue;
          const linkCell = row.values[2];
          let link = '';

          if (linkCell && linkCell.hyperlink) {
            link = linkCell.hyperlink;
          }

          products.push({
            rowIdx: i + 1,
            produto: produto,
            link: link
          });
        }
      }
    }

    fs.writeFileSync('all_products_with_links.json', JSON.stringify(products, null, 2));
    console.log(`✅ ${products.length} produtos com links encontrados`);
    console.log('\nPrimeiros 5:');
    console.log(JSON.stringify(products.slice(0, 5), null, 2));

  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
