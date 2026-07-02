const { google } = require('C:/Users/Administrador.LAURAFERREIRA/AppData/Roaming/npm/node_modules/@modelcontextprotocol/server-gdrive/node_modules/googleapis/build/src/index.js');
const fs = require('fs');

const OAUTH_KEYS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/gcp-oauth.keys.json';
const CREDENTIALS_PATH = 'C:/Users/Administrador.LAURAFERREIRA/Downloads/.gdrive-server-credentials.json';

const ACOMP_ID = '1902H_f_1PpnA9M0E_MpHEYfavj4U-nwKGzurbvf8PYg';
const RADAR_ID = '1ZBQ3uukBeIIzSDaD1H1H-1xCkyNcB_dHHSck76m9G_8';

// Acompanhamento Ofertas (15 produtos)
// rows 1-2 → DIA6 = col[11] = coluna L
// rows 3-15 → DIA4 = col[9] = coluna J
// Sheet row = rowIdx + 2
const acompanhamentoData = [
  { range: 'L2', value: 38 },  // Atividade cursiva DIA6
  { range: 'L3', value: 36 },  // Receitas airfrayer DIA6
  { range: 'J4', value: 46 },  // DoramaFlix DIA4
  { range: 'J5', value: 3  },  // Receitas rápidas DIA4
  { range: 'J6', value: 10 },  // Cristão (geografia-biblica-es) DIA4
  { range: 'J7', value: 9  },  // Aprender Kids DIA4
  { range: 'J8', value: 3  },  // Treino Futsal DIA4
  { range: 'J9', value: 42 },  // Jiujistu DIA4
  { range: 'J10', value: 18 }, // Cristão (biblical-geography) DIA4
  { range: 'J11', value: 54 }, // Protocolo gelatina DIA4
  { range: 'J12', value: 25 }, // Receitas Marmita Fit DIA4
  { range: 'J13', value: 22 }, // Alfabetização DIA4
  { range: 'J14', value: 19 }, // Recheios DIA4
  { range: 'J15', value: 24 }, // Exercicios Black DIA4
  { range: 'J16', value: 0  }, // 365 Versiculos DIA4
];

// Radar de Ofertas (21 produtos)
// rows 1-2 → DIA6 = col[12] = coluna M
// rows 3-21 → DIA4 = col[10] = coluna K
const radarData = [
  { range: 'M2', value: 38 },  // Atividade cursiva DIA6
  { range: 'M3', value: 36 },  // Receitas airfrayer DIA6
  { range: 'K4', value: 46 },  // DoramaFlix DIA4
  { range: 'K5', value: 3  },  // Receitas rápidas DIA4
  { range: 'K6', value: 10 },  // Cristão (geografia-biblica-es) DIA4
  { range: 'K7', value: 9  },  // Aprender Kids DIA4
  { range: 'K8', value: 3  },  // Treino Futsal DIA4
  { range: 'K9', value: 42 },  // Jiujistu DIA4
  { range: 'K10', value: 18 }, // Cristão (biblical-geography) DIA4
  { range: 'K11', value: 10 }, // Cristão (omapadabibliabr) DIA4
  { range: 'K12', value: 54 }, // Protocolo gelatina DIA4
  { range: 'K13', value: 6  }, // Calistenia DIA4
  { range: 'K14', value: 28 }, // GPT Nutricionistas DIA4
  { range: 'K15', value: 7  }, // Modelos de Story DIA4
  { range: 'K16', value: 88 }, // Saxofone DIA4
  { range: 'K17', value: 25 }, // Receitas Marmita Fit DIA4
  { range: 'K18', value: 22 }, // Alfabetização DIA4
  { range: 'K19', value: 19 }, // Recheios DIA4
  { range: 'K20', value: 24 }, // Exercicios Black DIA4
  { range: 'K21', value: 0  }, // 365 Versiculos DIA4
  { range: 'K22', value: 17 }, // Caligrafia DIA4
];

async function writeToSheet(sheets, spreadsheetId, data, nome) {
  const updateData = data.map(d => ({
    range: d.range,
    values: [[d.value]],
  }));

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: {
      valueInputOption: 'RAW',
      data: updateData,
    },
  });

  console.log(`✅ ${nome}: ${data.length} células gravadas`);
  data.forEach(d => console.log(`   ${d.range} = ${d.value}`));
}

async function main() {
  const oauthKeys = JSON.parse(fs.readFileSync(OAUTH_KEYS_PATH, 'utf8'));
  const savedCredentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const clientKeys = oauthKeys.installed || oauthKeys.web;

  const auth = new google.auth.OAuth2(
    clientKeys.client_id,
    clientKeys.client_secret,
    clientKeys.redirect_uris[0]
  );
  auth.setCredentials(savedCredentials);

  const sheets = google.sheets({ version: 'v4', auth });

  await writeToSheet(sheets, ACOMP_ID, acompanhamentoData, 'Acompanhamento Ofertas');
  await writeToSheet(sheets, RADAR_ID, radarData, 'Radar de Ofertas');

  console.log('\n🎉 Conferência de Ofertas 19/03/2026 concluída!');
}

main().catch(console.error);
