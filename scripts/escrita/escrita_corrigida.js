const fs = require('fs');
const { google } = require('googleapis');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';
const SPREADSHEET_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';

function log(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${msg}`);
}

function authorize() {
  try {
    if (!fs.existsSync(OAUTH_KEYS_PATH)) {
      throw new Error(`OAuth keys nao encontrado: ${OAUTH_KEYS_PATH}`);
    }
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`Credentials nao encontrado: ${CREDENTIALS_PATH}`);
    }

    const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
    const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    const clientKeys = oauthKeys.installed || oauthKeys.web;

    const auth = new google.auth.OAuth2(
      clientKeys.client_id,
      clientKeys.client_secret,
      clientKeys.redirect_uris[0]
    );

    auth.setCredentials(savedCredentials);
    return auth;
  } catch (err) {
    log(`ERRO FATAL: ${err.message}`);
    process.exit(1);
  }
}

async function gravar() {
  const auth = authorize();
  const sheets = google.sheets({ version: 'v4', auth });

  // Ler coleta_corrigida.json
  if (!fs.existsSync('coleta_corrigida.json')) {
    throw new Error('coleta_corrigida.json nao encontrado');
  }

  const coleta = JSON.parse(fs.readFileSync('coleta_corrigida.json', 'utf8'));
  log(`Lidos ${coleta.length} registros de coleta_corrigida.json`);

  // Validar
  let validos = 0;
  for (const item of coleta) {
    if (item.rowIdx && ('valor' in item) && item.colDia !== undefined) {
      if (item.valor === null || (typeof item.valor === 'number' && item.valor >= 0 && item.valor <= 2000)) {
        validos++;
      }
    }
  }

  log(`[VALIDACAO] ${validos}/${coleta.length} registros validos`);

  // Preparar updates por célula
  const updates = [];
  let totalCelulas = 0;

  for (const item of coleta) {
    if (item.valor === null) continue; // Pular nulls

    const rowNum = item.rowIdx + 1; // rowIdx 0-based -> row 1-based
    const colLetra = String.fromCharCode(65 + item.colDia); // 0='A', 1='B', ... 9='J', ...
    const cellAddress = `${colLetra}${rowNum}`;

    updates.push({
      range: cellAddress,
      values: [[item.valor]]
    });
    totalCelulas++;
  }

  log(`Preparadas ${totalCelulas} celulas para escrita...`);

  if (totalCelulas === 0) {
    log('[!] Nenhuma celula para gravar!');
    process.exit(1);
  }

  // Gravar em batch
  const requests = updates.map(u => ({
    range: u.range,
    values: u.values
  }));

  log('Gravando dados na planilha...');

  const response = await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      valueInputOption: 'USER_ENTERED',
      data: requests
    }
  });

  log(`[OK] ${response.data.updatedCells} celulas atualizadas com sucesso!`);
  log('');
  log('[OK] ESCRITA CORRIGIDA CONCLUIDA!');
}

gravar()
  .then(() => process.exit(0))
  .catch(err => {
    log(`ERRO: ${err.message}`);
    process.exit(1);
  });
