const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';

const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

function colLetter(idx) {
  return String.fromCharCode(65 + idx);
}

function cell(colDia, rowIdx) {
  return colLetter(colDia) + (rowIdx + 1);
}

async function main() {
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));

  const { client_id, client_secret } = keys.installed || keys.web;
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  oauth2Client.setCredentials(credentials);

  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const acompData = [
    { range: cell(13, 1),  values: [[38]]  },
    { range: cell(13, 2),  values: [[33]]  },
    { range: cell(11, 3),  values: [[48]]  },
    { range: cell(11, 4),  values: [[3]]   },
    { range: cell(11, 5),  values: [[10]]  },
    { range: cell(11, 6),  values: [[20]]  },
    { range: cell(11, 7),  values: [[11]]  },
    { range: cell(11, 8),  values: [[30]]  },
    { range: cell(11, 9),  values: [[18]]  },
    { range: cell(11, 10), values: [[51]]  },
    { range: cell(11, 11), values: [[36]]  },
    { range: cell(11, 12), values: [[22]]  },
    { range: cell(11, 13), values: [[20]]  },
    { range: cell(11, 14), values: [[33]]  },
    { range: cell(11, 15), values: [[9]]   },
    { range: cell(8,  16), values: [[6]]   },
    { range: cell(8,  17), values: [[10]]  },
    { range: cell(8,  18), values: [[110]] },
    { range: cell(8,  19), values: [[10]]  },
    { range: cell(8,  20), values: [[19]]  },
    { range: cell(8,  21), values: [[16]]  },
    { range: cell(8,  22), values: [[210]] },
    { range: cell(8,  23), values: [[22]]  },
    { range: cell(8,  24), values: [[20]]  },
    { range: cell(8,  25), values: [[17]]  },
    { range: cell(8,  26), values: [[42]]  },
  ];

  const radarData = [
    { range: cell(14, 1),  values: [[38]]  },
    { range: cell(14, 2),  values: [[33]]  },
    { range: cell(12, 3),  values: [[48]]  },
    { range: cell(12, 4),  values: [[3]]   },
    { range: cell(12, 5),  values: [[10]]  },
    { range: cell(12, 6),  values: [[20]]  },
    { range: cell(12, 7),  values: [[11]]  },
    { range: cell(12, 8),  values: [[30]]  },
    { range: cell(12, 9),  values: [[12]]  },
    { range: cell(12, 10), values: [[18]]  },
    { range: cell(12, 11), values: [[51]]  },
    { range: cell(12, 12), values: [[3]]   },
    { range: cell(12, 13), values: [[19]]  },
    { range: cell(12, 14), values: [[10]]  },
    { range: cell(12, 15), values: [[42]]  },
    { range: cell(12, 16), values: [[36]]  },
    { range: cell(12, 17), values: [[22]]  },
    { range: cell(12, 18), values: [[20]]  },
    { range: cell(12, 19), values: [[33]]  },
    { range: cell(12, 20), values: [[9]]   },
    { range: cell(12, 21), values: [[20]]  },
    { range: cell(9,  22), values: [[6]]   },
    { range: cell(9,  23), values: [[10]]  },
    { range: cell(9,  24), values: [[110]] },
    { range: cell(9,  25), values: [[10]]  },
    { range: cell(9,  26), values: [[19]]  },
    { range: cell(9,  27), values: [[16]]  },
    { range: cell(9,  28), values: [[210]] },
    { range: cell(9,  29), values: [[22]]  },
    { range: cell(9,  30), values: [[20]]  },
    { range: cell(9,  31), values: [[17]]  },
  ];

  console.log('Gravando Acompanhamento Ofertas...');
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ACOMP,
    requestBody: { valueInputOption: 'RAW', data: acompData },
  });
  console.log('✓ Acompanhamento: ' + acompData.length + ' células gravadas');

  console.log('Gravando Radar de Ofertas...');
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_RADAR,
    requestBody: { valueInputOption: 'RAW', data: radarData },
  });
  console.log('✓ Radar: ' + radarData.length + ' células gravadas');

  console.log('\n✅ Conferência de Ofertas concluída com sucesso!');
}

main().catch(console.error);
