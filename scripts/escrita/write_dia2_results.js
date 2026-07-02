const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const SHEET_NAME = 'Página1';

// Dados coletados hoje
const resultados = [
  { rowIdx: 1, colDia: 7, produto: 'Tarot', valor: 68 },
  { rowIdx: 8, colDia: 7, produto: 'Como plantar', valor: 5 },
  { rowIdx: 12, colDia: 7, produto: 'Neuropro', valor: 56 }
];

async function getAuthClient() {
  const credPath = path.join(process.env.USERPROFILE, 'Downloads', '.gdrive-server-credentials.json');
  const keyPath = path.join(process.env.USERPROFILE, 'Downloads', 'gcp-oauth.keys.json');

  let auth;

  if (fs.existsSync(credPath)) {
    const credentials = JSON.parse(fs.readFileSync(credPath, 'utf8'));
    auth = new google.auth.GoogleAuth({
      credentials: credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else if (fs.existsSync(keyPath)) {
    auth = new google.auth.GoogleAuth({
      keyFilename: keyPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
  } else {
    throw new Error('Credenciais não encontradas');
  }

  return auth.getClient();
}

function rowColToA1(row, col) {
  let colLetter = '';
  let c = col;
  while (c >= 0) {
    colLetter = String.fromCharCode(65 + (c % 26)) + colLetter;
    c = Math.floor(c / 26) - 1;
  }
  return `${colLetter}${row}`;
}

async function gravarDados() {
  try {
    const auth = await getAuthClient();
    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar updates
    const updates = resultados.map(r => {
      const sheetRow = r.rowIdx + 1;
      const a1Notation = rowColToA1(sheetRow, r.colDia);

      return {
        range: `${SHEET_NAME}!${a1Notation}`,
        values: [[r.valor]]
      };
    });

    console.log('\n📝 Preparando para gravar:');
    updates.forEach((u, idx) => {
      console.log(`   ${idx + 1}. ${resultados[idx].produto}: ${u.range} = ${resultados[idx].valor}`);
    });

    // Executar batch update
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        data: updates,
        valueInputOption: 'USER_ENTERED',
      },
    });

    console.log(`\n✅ Gravação concluída!`);
    console.log(`   ${response.data.totalUpdatedCells} células gravadas`);
    console.log(`   ${response.data.totalUpdatedRows} linhas atualizadas`);

    resultados.forEach(r => {
      console.log(`   ✓ ${r.produto}: ${r.valor} anúncios`);
    });

  } catch (error) {
    console.error('❌ Erro ao gravar:', error.message);
    process.exit(1);
  }
}

gravarDados();
