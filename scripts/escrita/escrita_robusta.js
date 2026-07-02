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
      throw new Error(`OAuth keys nao encontrado em: ${OAUTH_KEYS_PATH}`);
    }
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      throw new Error(`Credentials nao encontrado em: ${CREDENTIALS_PATH}`);
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
    log(`ERRO FATAL: Autenticacao falhou - ${err.message}`);
    process.exit(1);
  }
}

async function validarDados(coleta) {
  log(`Validando ${coleta.length} registros...`);

  let validos = 0;
  let invalidos = 0;

  for (const item of coleta) {
    // Validar estrutura
    if (!item.rowIdx || !('valor' in item) || item.colDia === undefined) {
      log(`  [!] Registro invalido: ${JSON.stringify(item).substring(0, 50)}`);
      invalidos++;
      continue;
    }

    // Validar valores
    if (item.valor !== null && (typeof item.valor !== 'number' || item.valor < 0 || item.valor > 1000)) {
      log(`  [!] Valor suspeito para rowIdx ${item.rowIdx}: ${item.valor}`);
      invalidos++;
      continue;
    }

    validos++;
  }

  log(`[OK] ${validos} registros validos, ${invalidos} invalidos`);

  if (invalidos > coleta.length * 0.1) {  // Mais de 10% invalido = erro
    throw new Error(`Dados muito corrompidos: ${invalidos}/${coleta.length}`);
  }

  return true;
}

async function escreverDados(auth) {
  const sheets = google.sheets({ version: 'v4', auth });

  // Ler e validar coleta_python.json
  if (!fs.existsSync('coleta_python.json')) {
    throw new Error('Arquivo coleta_python.json nao encontrado. Execute coleta_robusta.py primeiro.');
  }

  const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));
  log(`Lido ${coleta.length} registros de coleta_python.json`);

  // Validar dados
  await validarDados(coleta);

  // Criar mapa rowIdx -> valor
  const coletaMap = {};
  let nullCount = 0;
  for (const item of coleta) {
    coletaMap[item.rowIdx] = item.valor;
    if (item.valor === null) nullCount++;
  }

  log(`${nullCount} registros com valor null (pulados)`);

  // Preparar dados para escrita
  // rowIdx 1 = linha 2 do sheet (linha 1 eh header)
  // G2 eh colDia=6 (DIA 1), G3 eh rowIdx 2, etc.
  const updateData = [];

  for (let i = 1; i <= 67; i++) {
    if (coletaMap[i] !== undefined && coletaMap[i] !== null) {
      updateData.push({
        range: `G${i + 1}`,  // G2 para rowIdx 1
        majorDimension: 'ROWS',
        values: [[coletaMap[i]]]
      });
    }
  }

  log(`Preparados ${updateData.length} celulas para escrita...`);

  // Executar escrita
  try {
    const response = await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        data: updateData,
        valueInputOption: 'RAW'
      }
    });

    const updated = response.data.responses?.[0]?.updatedCells || updateData.length;
    log(`[OK] ${updated} celulas atualizadas com sucesso`);

  } catch (err) {
    log(`ERRO ao escrever: ${err.message}`);
    throw err;
  }

  return true;
}

async function main() {
  try {
    log('=== ESCRITA ROBUSTA — CONFERENCIA DE OFERTAS ===');
    log('');

    const auth = authorize();
    log('[OK] Autenticacao bem-sucedida');

    await escreverDados(auth);

    log('');
    log('[OK] SUCESSO! Dados escritos na planilha.');
    log('Proxima etapa: Executar read_sheet.js para verificar');
    log('');

  } catch (err) {
    log(`ERRO FATAL: ${err.message}`);
    process.exit(1);
  }
}

main();
