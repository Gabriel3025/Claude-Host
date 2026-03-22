const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SHEET_ACOMP = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_RADAR = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

function colLetter(idx) { return String.fromCharCode(65 + idx); }
function cell(colDia, rowIdx) { return colLetter(colDia) + (rowIdx + 1); }

async function main() {
  const keys = JSON.parse(fs.readFileSync(KEYS_PATH));
  const oauthKeys = keys.installed || keys.web;
  const creds = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

  const auth = new google.auth.OAuth2(oauthKeys.client_id, oauthKeys.client_secret);
  auth.setCredentials({
    access_token: creds.access_token,
    refresh_token: creds.refresh_token,
  });
  const sheets = google.sheets({ version: 'v4', auth });

  // ACOMPANHAMENTO — 26 células
  const acompData = [
    { range: cell(14,1), values: [[38]] },
    { range: cell(14,2), values: [[33]] },
    { range: cell(12,3), values: [[49]] },
    { range: cell(12,4), values: [[3]] },
    { range: cell(12,5), values: [[10]] },
    { range: cell(12,6), values: [[14]] },
    { range: cell(12,7), values: [[11]] },
    { range: cell(12,8), values: [[37]] },
    { range: cell(12,9), values: [[18]] },
    { range: cell(12,10), values: [[51]] },
    { range: cell(12,11), values: [[36]] },
    { range: cell(12,12), values: [[22]] },
    { range: cell(12,13), values: [[20]] },
    { range: cell(12,14), values: [[37]] },
    { range: cell(12,15), values: [[0]] },
    { range: cell(9,16),  values: [[6]] },
    { range: cell(9,17),  values: [[10]] },
    { range: cell(9,18),  values: [[110]] },
    { range: cell(9,19),  values: [[10]] },
    { range: cell(9,20),  values: [[19]] },
    { range: cell(9,21),  values: [[15]] },
    { range: cell(9,22),  values: [[210]] },
    { range: cell(9,23),  values: [[25]] },
    { range: cell(9,24),  values: [[0]] },
    { range: cell(9,25),  values: [[13]] },
    { range: cell(9,26),  values: [[42]] },
  ];

  // RADAR — 31 células
  const radarData = [
    { range: cell(15,1),  values: [[38]] },
    { range: cell(15,2),  values: [[33]] },
    { range: cell(13,3),  values: [[49]] },
    { range: cell(13,4),  values: [[3]] },
    { range: cell(13,5),  values: [[10]] },
    { range: cell(13,6),  values: [[14]] },
    { range: cell(13,7),  values: [[11]] },
    { range: cell(13,8),  values: [[37]] },
    { range: cell(13,9),  values: [[9]] },
    { range: cell(13,10), values: [[18]] },
    { range: cell(13,11), values: [[51]] },
    { range: cell(13,12), values: [[3]] },
    { range: cell(13,13), values: [[20]] },
    { range: cell(13,14), values: [[5]] },
    { range: cell(13,15), values: [[42]] },
    { range: cell(13,16), values: [[36]] },
    { range: cell(13,17), values: [[22]] },
    { range: cell(13,18), values: [[20]] },
    { range: cell(13,19), values: [[37]] },
    { range: cell(13,20), values: [[0]] },
    { range: cell(13,21), values: [[16]] },
    { range: cell(10,22), values: [[6]] },
    { range: cell(10,23), values: [[10]] },
    { range: cell(10,24), values: [[110]] },
    { range: cell(10,25), values: [[10]] },
    { range: cell(10,26), values: [[19]] },
    { range: cell(10,27), values: [[15]] },
    { range: cell(10,28), values: [[210]] },
    { range: cell(10,29), values: [[25]] },
    { range: cell(10,30), values: [[0]] },
    { range: cell(10,31), values: [[13]] },
  ];

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ACOMP,
    requestBody: { valueInputOption: 'RAW', data: acompData },
  });
  console.log(`✓ Acompanhamento: ${acompData.length} células gravadas`);

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_RADAR,
    requestBody: { valueInputOption: 'RAW', data: radarData },
  });
  console.log(`✓ Radar: ${radarData.length} células gravadas`);
}

main().catch(console.error);
