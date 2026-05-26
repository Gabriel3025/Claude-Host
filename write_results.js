const { google } = require('googleapis');
const fs = require('fs');

const credentialsPath = '../.gdrive-server-credentials.json';
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

const sheets = google.sheets('v4');

const acompanhamentoData = [
  [1, 0], [8, 0], [12, 0], [20, 0], [21, 0], [24, 0], [26, 0], [27, 23],
  [28, 0], [29, 0], [30, 18], [31, 11], [32, 130], [33, 0], [34, 34],
  [35, 4], [36, 92], [37, 0], [38, 0], [39, 10], [40, 81], [41, 82],
  [42, 20], [43, 24], [44, 10], [45, 0], [46, 0], [47, 0], [48, 0],
  [49, 0], [50, 1], [51, 19], [52, 29], [53, 99], [54, 14], [55, 0],
  [56, 12], [57, 0], [58, 3], [59, 0], [60, 9], [61, 7], [62, 9],
  [63, 9], [64, 99], [65, 180], [66, 22], [67, 32], [68, 14], [69, 10], [70, 13]
];

(async () => {
  const auth = new google.auth.OAuth2();
  auth.setCredentials(credentials);

  try {
    console.log('Gravando em Acompanhamento Ofertas (DIA 2)...');
    let count = 0;
    for (const [rowIdx, val] of acompanhamentoData) {
      const range = `G${rowIdx + 1}`;
      try {
        await sheets.spreadsheets.values.update({
          auth,
          spreadsheetId: '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg',
          range,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[val]]
          }
        });
        process.stdout.write('.');
        count++;
      } catch (e) {
        console.error(`\nErro na linha ${rowIdx}: ${e.message}`);
      }
    }
    console.log(`\n✅ ${count} células gravadas!`);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  }
})();
