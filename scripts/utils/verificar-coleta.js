#!/usr/bin/env node
/**
 * Script de Verificação — Conferência de Ofertas
 *
 * Valida integridade dos dados coletados vs. escritos na planilha
 * Usa: coleta_python.json + read_sheet.js
 */

const fs = require('fs');
const { spawn } = require('child_process');

function log(msg) {
  console.log(`[*] ${msg}`);
}

function warn(msg) {
  console.log(`[!] ${msg}`);
}

function error(msg) {
  console.log(`[X] ${msg}`);
}

function success(msg) {
  console.log(`[OK] ${msg}`);
}

async function runReadSheet() {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', ['read_sheet.js'], {
      stdio: 'pipe',
      shell: true
    });

    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        try {
          const json = output.substring(output.indexOf('['));
          const data = JSON.parse(json);
          resolve(data);
        } catch (e) {
          reject(new Error('Nao foi possivel parsear output de read_sheet.js'));
        }
      } else {
        reject(new Error('read_sheet.js falhou'));
      }
    });
  });
}

async function main() {
  try {
    console.log('');
    console.log('=== VERIFICADOR DE COLETA ===');
    console.log('');

    // Passo 1: Validar coleta_python.json
    log('Verificando coleta_python.json...');

    if (!fs.existsSync('coleta_python.json')) {
      error('coleta_python.json nao encontrado!');
      process.exit(1);
    }

    const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));
    success(`${coleta.length} registros encontrados`);

    // Validar estrutura
    let erros = 0;
    for (const item of coleta) {
      if (!item.rowIdx || item.colDia === undefined || !('valor' in item)) {
        error(`Registro invalido: ${JSON.stringify(item)}`);
        erros++;
      }
      if (item.valor !== null && (item.valor < 0 || item.valor > 1000)) {
        warn(`Valor suspeito em rowIdx ${item.rowIdx}: ${item.valor}`);
      }
    }

    if (erros > 0) {
      error(`${erros} registros com estrutura invalida`);
      process.exit(1);
    }

    success('Estrutura de dados valida');
    console.log('');

    // Passo 2: Comparar com planilha
    log('Comparando com dados da planilha (read_sheet.js)...');
    log('(Isso pode demorar alguns segundos)');
    console.log('');

    const sheetData = await runReadSheet();
    success(`${sheetData.length} produtos lidos da planilha`);

    // Criar mapas
    const coletaMap = {};
    const sheetMap = {};

    for (const item of coleta) {
      coletaMap[item.rowIdx] = item.valor;
    }

    for (const item of sheetData) {
      sheetMap[item.rowIdx] = item.valorAtual === '' ? null : parseInt(item.valorAtual);
    }

    // Comparar valores
    let matches = 0;
    let mismatches = 0;
    const mismatchDetails = [];

    for (const rowIdx in coletaMap) {
      const coletado = coletaMap[rowIdx];
      const noSheet = sheetMap[rowIdx];

      if (coletado === null && noSheet === null) {
        matches++;
      } else if (coletado === noSheet) {
        matches++;
      } else {
        mismatches++;
        const sheetItem = sheetData.find(s => s.rowIdx == rowIdx);
        mismatchDetails.push({
          rowIdx,
          produto: sheetItem?.produto || 'DESCONHECIDO',
          coletado,
          noSheet
        });
      }
    }

    console.log('');
    log('Resultado da comparacao:');
    success(`${matches} coincidencias`);

    if (mismatches > 0) {
      error(`${mismatches} DISCREPANCIAS DETECTADAS!`);
      console.log('');
      warn('Produtos com valores diferentes:');
      mismatchDetails.forEach(m => {
        console.log(`  [${m.rowIdx}] ${m.produto}`);
        console.log(`      Coletado: ${m.coletado}`);
        console.log(`      No Sheet: ${m.noSheet}`);
      });
      console.log('');
      warn('ATENCAO: Possivel erro na escrita ou coleta reexecutada');
    }

    // Validacoes criticas
    console.log('');
    log('Validacoes criticas:');

    const criticalRows = [39, 40, 63, 64, 65];
    let allOk = true;

    for (const rowIdx of criticalRows) {
      const produto = sheetData.find(s => s.rowIdx == rowIdx);
      const valorColetado = coletaMap[rowIdx];
      const valorSheet = sheetMap[rowIdx];

      if (valorColetado === valorSheet) {
        success(`rowIdx ${rowIdx} (${produto?.produto}): ${valorColetado}`);
      } else {
        error(`rowIdx ${rowIdx} (${produto?.produto}): coletado=${valorColetado}, sheet=${valorSheet}`);
        allOk = false;
      }
    }

    // Estatisticas
    console.log('');
    log('Estatisticas:');

    const comValor = coleta.filter(c => c.valor !== null);
    const totalAds = comValor.reduce((sum, c) => sum + c.valor, 0);

    success(`Total de anuncios: ${totalAds}`);
    success(`Produtos com valor: ${comValor.length}/${coleta.length}`);
    success(`Media por produto: ${(totalAds / comValor.length).toFixed(1)}`);

    // Relatorio final
    console.log('');
    console.log('=== RESULTADO FINAL ===');

    if (allOk && mismatches === 0) {
      success('TUDO OK! Coleta verificada com sucesso.');
      console.log('');
      log('Proximos passos:');
      log('  1. Abrir a planilha e fazer revisao visual');
      log('  2. Fazer commit via git');
      log('  3. Preparar para DIA 2 amanha');
      console.log('');
      process.exit(0);
    } else {
      error('PROBLEMA DETECTADO! Revisar dados antes de confirmar.');
      console.log('');
      log('Proximos passos:');
      log('  1. Revisar discrepancias acima');
      log('  2. Se for erro de escrita: execute escrita_robusta.js novamente');
      log('  3. Se for erro de coleta: execute coleta_robusta.py novamente');
      console.log('');
      process.exit(1);
    }

  } catch (err) {
    console.log('');
    error(`ERRO: ${err.message}`);
    console.log('');
    process.exit(1);
  }
}

main();
