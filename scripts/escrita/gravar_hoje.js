const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const credPath = path.join('C:', 'Users', 'Administrador.LAURAFERREIRA', 'Downloads', '.gdrive-server-credentials.json');
const keysPath = path.join('C:', 'Users', 'Administrador.LAURAFERREIRA', 'Downloads', 'gcp-oauth.keys.json');

const credentials = JSON.parse(fs.readFileSync(credPath));
const keys = JSON.parse(fs.readFileSync(keysPath));

const { client_id, client_secret } = keys.installed || keys.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret);
oAuth2Client.setCredentials(credentials);

const sheets = google.sheets({ version: 'v4', auth: oAuth2Client });
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

const resultados = [
  { rowIdx: 87, colDia: 13, produto: 'Exercícios para TDAH', valor: 6 },
  { rowIdx: 88, colDia: 13, produto: 'Molde Roupa PET', valor: 17 },
  { rowIdx: 89, colDia: 13, produto: 'Cristão + Hidroponica', valor: 15 },
  { rowIdx: 90, colDia: 13, produto: 'TCC com IA', valor: 140 },
  { rowIdx: 91, colDia: 13, produto: 'Catalogo Estética automotiva', valor: 13 },
  { rowIdx: 92, colDia: 13, produto: 'Atividades para idosos', valor: 16 },
  { rowIdx: 93, colDia: 13, produto: 'Atividades para copa', valor: 0 },
  { rowIdx: 94, colDia: 13, produto: 'Adesivo Sono', valor: 64 },
  { rowIdx: 95, colDia: 13, produto: 'Simulado CNH', valor: 12 },
  { rowIdx: 96, colDia: 13, produto: 'Matemática Minecraft', valor: 1 },
  { rowIdx: 97, colDia: 13, produto: 'Desafio 21 dias Emagrec.', valor: 34 },
  { rowIdx: 98, colDia: 13, produto: 'Brinquedos de Papel', valor: 27 },
  { rowIdx: 99, colDia: 12, produto: 'A história do lider (Política)', valor: 0 },
];

function colIndexToLetter(idx) {
  let letter = '';
  idx += 1;
  while (idx > 0) {
    const mod = (idx - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    idx = Math.floor((idx - 1) / 26);
  }
  return letter;
}

async function gravar() {
  const data = resultados.map(r => {
    const sheetRow = r.rowIdx + 1;
    const colLetter = colIndexToLetter(r.colDia);
    const range = colLetter + sheetRow;
    return { range, values: [[r.valor]] };
  });

  console.log('Ranges a gravar:');
  data.forEach((d, i) => console.log('  ' + d.range + ' = ' + resultados[i].valor + ' (' + resultados[i].produto + ')'));


  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'RAW',
      data: data
    }
  });

  console.log('\nCélulas atualizadas:', response.data.totalUpdatedCells);
  data.forEach((d, i) => {
    console.log('✅ ' + d.range + ' = ' + resultados[i].valor + ' (' + resultados[i].produto + ')');
  });
  console.log('\n✅ GRAVAÇÃO CONCLUÍDA — ' + resultados.length + ' produtos gravados');
}

gravar().catch(err => { console.error('ERRO:', err.message); process.exit(1); });
