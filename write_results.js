const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cell(colDia, rowIdx) { return colLetter(colDia) + (rowIdx + 1); }

const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
const oauthKeys = keys.installed || keys.web;
const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
auth.setCredentials({ access_token: creds.access_token, refresh_token: creds.refresh_token });

const sheets = google.sheets({ version: 'v4', auth });

const acompData = [
  { rowIdx: 1,  colDia: 15, value: 38  },
  { rowIdx: 2,  colDia: 15, value: 33  },
  { rowIdx: 3,  colDia: 13, value: 50  },
  { rowIdx: 4,  colDia: 13, value: 3   },
  { rowIdx: 5,  colDia: 13, value: 10  },
  { rowIdx: 6,  colDia: 13, value: 11  },
  { rowIdx: 7,  colDia: 13, value: 11  },
  { rowIdx: 8,  colDia: 13, value: 49  },
  { rowIdx: 9,  colDia: 13, value: 18  },
  { rowIdx: 10, colDia: 13, value: 46  },
  { rowIdx: 11, colDia: 13, value: 36  },
  { rowIdx: 12, colDia: 13, value: 22  },
  { rowIdx: 13, colDia: 13, value: 19  },
  { rowIdx: 14, colDia: 13, value: 16  },
  { rowIdx: 15, colDia: 13, value: 18  },
  { rowIdx: 16, colDia: 10, value: 6   },
  { rowIdx: 17, colDia: 10, value: 0   },
  { rowIdx: 18, colDia: 10, value: 100 },
  { rowIdx: 19, colDia: 10, value: 6   },
  { rowIdx: 20, colDia: 10, value: 20  },
  { rowIdx: 21, colDia: 10, value: 16  },
  { rowIdx: 22, colDia: 10, value: 130 },
  { rowIdx: 23, colDia: 10, value: 13  },
  { rowIdx: 24, colDia: 10, value: 0   },
  { rowIdx: 25, colDia: 10, value: 12  },
  { rowIdx: 26, colDia: 10, value: 1   },
  { rowIdx: 27, colDia: 7,  value: 8   },
];

const radarData = [
  { rowIdx: 1,  colDia: 16, value: 38  },
  { rowIdx: 2,  colDia: 16, value: 33  },
  { rowIdx: 3,  colDia: 14, value: 50  },
  { rowIdx: 4,  colDia: 14, value: 3   },
  { rowIdx: 5,  colDia: 14, value: 10  },
  { rowIdx: 6,  colDia: 14, value: 11  },
  { rowIdx: 7,  colDia: 14, value: 11  },
  { rowIdx: 8,  colDia: 14, value: 49  },
  { rowIdx: 9,  colDia: 14, value: 19  },
  { rowIdx: 10, colDia: 14, value: 18  },
  { rowIdx: 11, colDia: 14, value: 46  },
  { rowIdx: 12, colDia: 14, value: 3   },
  { rowIdx: 13, colDia: 14, value: 20  },
  { rowIdx: 14, colDia: 14, value: 5   },
  { rowIdx: 15, colDia: 14, value: 1   },
  { rowIdx: 16, colDia: 14, value: 36  },
  { rowIdx: 17, colDia: 14, value: 22  },
  { rowIdx: 18, colDia: 14, value: 19  },
  { rowIdx: 19, colDia: 14, value: 16  },
  { rowIdx: 20, colDia: 14, value: 18  },
  { rowIdx: 21, colDia: 14, value: 16  },
  { rowIdx: 22, colDia: 11, value: 6   },
  { rowIdx: 23, colDia: 11, value: 0   },
  { rowIdx: 24, colDia: 11, value: 100 },
  { rowIdx: 25, colDia: 11, value: 6   },
  { rowIdx: 26, colDia: 11, value: 20  },
  { rowIdx: 27, colDia: 11, value: 16  },
  { rowIdx: 28, colDia: 11, value: 130 },
  { rowIdx: 29, colDia: 11, value: 13  },
  { rowIdx: 30, colDia: 11, value: 0   },
  { rowIdx: 31, colDia: 11, value: 12  },
  { rowIdx: 32, colDia: 8,  value: 3   },
  { rowIdx: 33, colDia: 8,  value: 8   },
];

async function write(spreadsheetId, data, label) {
  const updates = data.map(({ rowIdx, colDia, value }) => ({
    range: cell(colDia, rowIdx),
    values: [[value]],
  }));
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: 'RAW', data: updates },
  });
  console.log(`✓ ${label}: ${data.length} células gravadas`);
}

(async () => {
  try {
    await write(SHEET_ACOMP, acompData, 'Acompanhamento');
    await write(SHEET_RADAR, radarData, 'Radar');
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
