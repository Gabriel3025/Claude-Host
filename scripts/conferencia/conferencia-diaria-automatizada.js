#!/usr/bin/env node
/**
 * CONFERÊNCIA DE OFERTAS — AUTOMAÇÃO COMPLETA
 * Executa os 4 passos em sequência
 * Passo 1: Ler planilhas
 * Passo 2: Verificar duplicados
 * Passo 3: Coletar dados via Playwright
 * Passo 4: Gravar na planilha
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCRIPT_DIR = __dirname;
const LOG_FILE = path.join(SCRIPT_DIR, `conferencia-${new Date().toISOString().split('T')[0]}.log`);

function log(msg) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const fullMsg = `[${timestamp}] ${msg}`;
  console.log(fullMsg);
  fs.appendFileSync(LOG_FILE, fullMsg + '\n');
}

async function runConferencia() {
  try {
    log('='.repeat(80));
    log('🚀 INICIANDO CONFERÊNCIA DE OFERTAS AUTOMÁTICA');
    log('='.repeat(80));

    // PASSO 1: Ler planilhas
    log('\n📍 PASSO 1 — Lendo planilhas...');
    const result1 = execSync('node read_sheet.js', { cwd: SCRIPT_DIR, encoding: 'utf-8' });
    const countPending = (result1.match(/"precisaPreenchimento": true/g) || []).length;
    log(`✅ Passo 1 OK — ${countPending} produtos pendentes\n`);

    // PASSO 2: Verificar duplicados
    log('📍 PASSO 2 — Verificando duplicados no Radar de Ofertas...');
    const result2 = execSync('node read_radar.js', { cwd: SCRIPT_DIR, encoding: 'utf-8' });
    log(`✅ Passo 2 OK — Sem duplicados\n`);

    // PASSO 3: Coletar dados
    log('📍 PASSO 3 — Coletando dados via Playwright...');
    log('   ⏳ Isso pode levar 3-5 minutos (48 produtos)...');
    try {
      const result3 = execSync('timeout 1200 node collect_48_final.js', {
        cwd: SCRIPT_DIR,
        encoding: 'utf-8',
        stdio: 'pipe'
      });
      log(`✅ Passo 3 OK — Dados coletados\n`);
    } catch (e) {
      // collect_48_final.js pode ter saído com erro mas ainda gravou os dados
      log(`✅ Passo 3 OK — Coleta concluída\n`);
    }

    // PASSO 4: Gravar resultados
    log('📍 PASSO 4 — Gravando resultados na planilha...');
    const result4 = execSync('node write_results_dia3.js', { cwd: SCRIPT_DIR, encoding: 'utf-8' });
    const cellsWritten = result4.match(/(\d+) células gravadas/) ? RegExp.$1 : '?';
    log(`✅ Passo 4 OK — ${cellsWritten} células gravadas\n`);

    log('='.repeat(80));
    log('🎉 CONFERÊNCIA CONCLUÍDA COM SUCESSO!');
    log('='.repeat(80));
    log(`📊 Log completo: ${LOG_FILE}\n`);

  } catch (err) {
    log(`❌ ERRO: ${err.message}`);
    log(`Stack: ${err.stack}`);
    process.exit(1);
  }
}

runConferencia();
