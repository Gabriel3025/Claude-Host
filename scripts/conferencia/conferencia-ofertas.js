#!/usr/bin/env node
/**
 * ORQUESTRADOR — Conferência de Ofertas
 *
 * Executa:
 * 1. coleta_robusta.py — Coleta dados do Facebook
 * 2. escrita_robusta.js — Escreve na planilha
 * 3. Relatório final
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

function log(msg) {
  const time = new Date().toLocaleTimeString('pt-BR');
  console.log(`[${time}] ${msg}`);
}

function timestamp() {
  return new Date().toLocaleString('pt-BR');
}

function execCmd(cmd, args, description) {
  return new Promise((resolve, reject) => {
    log(`[EXEC] ${description}`);
    const proc = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(`[OK] ${description} concluido`);
        resolve();
      } else {
        log(`[ERRO] ${description} falhou com codigo ${code}`);
        reject(new Error(`${description} falhou`));
      }
    });

    proc.on('error', (err) => {
      log(`[ERRO] ${description} - ${err.message}`);
      reject(err);
    });
  });
}

async function main() {
  const startTime = new Date();

  try {
    log('================================================');
    log('   CONFERENCIA DE OFERTAS — ORQUESTRADOR');
    log('================================================');
    log('');

    // Passo 1: Coleta
    log('PASSO 1/3: COLETA DE DADOS');
    log('---');
    await execCmd('python', ['coleta_robusta.py'], 'Coleta robusta');
    log('');

    // Validar coleta_python.json
    if (!fs.existsSync('coleta_python.json')) {
      throw new Error('coleta_python.json nao foi gerado');
    }

    const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));
    log(`[VALIDACAO] ${coleta.length} registros coletados`);

    const comValor = coleta.filter(c => c.valor !== null);
    const totalAds = comValor.reduce((sum, c) => sum + c.valor, 0);
    log(`[STATS] Total: ${totalAds} anuncios em ${comValor.length} produtos`);
    log('');

    // Passo 2: Escrita
    log('PASSO 2/3: ESCRITA NA PLANILHA');
    log('---');
    await execCmd('node', ['escrita_robusta.js'], 'Escrita robusta');
    log('');

    // Passo 3: Relatorio
    log('PASSO 3/3: GERACAO DE RELATORIO');
    log('---');

    const topProducts = [...coleta]
      .filter(c => c.valor !== null)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 10);

    const relatorio = {
      timestamp: timestamp(),
      status: 'SUCESSO',
      totals: {
        produtosColetados: coleta.length,
        produtosComValor: comValor.length,
        totalAnuncios: totalAds,
        mediaAnunciosPorProduto: (totalAds / comValor.length).toFixed(1)
      },
      topProdutos: topProducts.map(p => ({
        rowIdx: p.rowIdx,
        produto: p.produto,
        anuncios: p.valor
      })),
      erros: coleta.filter(c => c.valor === null).map(c => ({
        rowIdx: c.rowIdx,
        produto: c.produto
      }))
    };

    fs.writeFileSync('relatorio_ofertas.json', JSON.stringify(relatorio, null, 2), 'utf8');
    log('[OK] Relatorio salvo: relatorio_ofertas.json');
    log('');

    // Resumo final
    const duration = ((new Date() - startTime) / 1000).toFixed(1);

    log('================================================');
    log('   RESUMO FINAL');
    log('================================================');
    log(`Duracao: ${duration}s`);
    log(`Total de anuncios: ${totalAds}`);
    log(`Produtos com anuncios: ${comValor.length}/${coleta.length}`);

    if (relatorio.erros.length > 0) {
      log(`Produtos com erro: ${relatorio.erros.length}`);
    }

    log('');
    log('Top 3 produtos:');
    topProducts.slice(0, 3).forEach((p, idx) => {
      log(`  ${idx + 1}. ${p.produto} — ${p.anuncios} anuncios`);
    });

    log('');
    log('[OK] CONFERENCIA CONCLUIDA COM SUCESSO!');
    log('');
    log('Proximos passos:');
    log('  1. Abrir a planilha e verificar dados');
    log('  2. Se tudo OK, fazer commit via git');
    log('  3. Para DIA 2, executar este script novamente amanha');
    log('');

  } catch (err) {
    log('');
    log('================================================');
    log('   ERRO FATAL');
    log('================================================');
    log(`Mensagem: ${err.message}`);
    log('');
    log('Troubleshooting:');
    log('  - Verificar se coleta_robusta.py executou OK');
    log('  - Verificar se escrita_robusta.js tem acesso a OAuth');
    log('  - Verificar conexao com internet');
    log('');
    process.exit(1);
  }
}

main();
