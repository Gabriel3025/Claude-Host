const fs = require('fs');

// Data manually extracted from the log output
const results = [
  { rowIdx: 1, produto: "Atividade cursiva", count: 18, source: "pre-validated" },
  { rowIdx: 2, produto: "Receitas airfrayer", count: 0 },
  { rowIdx: 3, produto: "DoramaFlix", count: 50 },
  { rowIdx: 4, produto: "Receitas rápidas", count: 0 },
  { rowIdx: 5, produto: "Cristão", count: 0 },
  { rowIdx: 6, produto: "Aprender Kids", count: 0 },
  { rowIdx: 7, produto: "Treino Futsal", count: 0 },
  { rowIdx: 8, produto: "Jiujistu", count: 7, source: "pre-validated" },
  { rowIdx: 9, produto: "Cristão", count: 5 },
  { rowIdx: 10, produto: "Protocolo gelatina", count: 0 },
  { rowIdx: 11, produto: "Receitas (Marmita Fit)", count: 0 },
  { rowIdx: 12, produto: "Alfabetização", count: 0, source: "pre-validated" },
  { rowIdx: 13, produto: "Recheios", count: 0 },
  { rowIdx: 14, produto: "Exercicios (Black)", count: 66 },
  { rowIdx: 15, produto: "365 Versiculos bíblia ⭐", count: 0 },
  { rowIdx: 16, produto: "Próxy Enzimático", count: 0 },
  { rowIdx: 17, produto: "Médoto P.E.I", count: 0 },
  { rowIdx: 18, produto: "Aprovação Concursos", count: 100 },
  { rowIdx: 19, produto: "Album Casamento", count: 10 },
  { rowIdx: 20, produto: "Pacotes de músicas", count: 0, source: "pre-validated" },
];

console.log('\n📊 RESULTADOS PARCIAIS PARA VALIDAÇÃO\n');
console.log('='.repeat(100));
console.log('Note: Pre-validated = 4 primeiros já confirmados pelo usuário');
console.log('='.repeat(100));

const table = results.map(r => ({
  'Row': r.rowIdx,
  'Produto': r.produto.substring(0, 30),
  'Count': r.count,
  'Status': r.source || 'extracted'
}));

console.table(table);

console.log('\n✅ Total com valor > 0: ' + results.filter(r => r.count > 0).length);
console.log('❓ Zeros para verificação: ' + results.filter(r => r.count === 0 && !r.source).length);

fs.writeFileSync('resultados_validacao.json', JSON.stringify(results, null, 2));
console.log('\n✅ Salvos em resultados_validacao.json');
