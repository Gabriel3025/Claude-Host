const fs = require('fs');

const coleta = JSON.parse(fs.readFileSync('coleta_python.json', 'utf8'));
const produtos_map = {
  1: "Atividade cursiva", 8: "Jiujistu", 12: "Alfabetização", 20: "Pacotes de músicas",
  21: "200 dinamicas cristã", 24: "Croche", 26: "Ebook bibílico", 27: "Ficha de Treino",
  28: "1.200 Moldes", 29: "Exerc. Anatomia", 30: "100 Brincadeiras", 31: "Moldes FOAM",
  32: "Organização", 33: "DryWall", 34: "Tarot", 35: "Plantar", 36: "Neuropro", 37: "120 dinamicas",
  38: "Moldes EVA", 39: "Airfryer", 40: "Saude", 41: "Emagrecimento", 42: "Cards",
  43: "Capivarinha", 44: "JiuJistsu LATAM", 45: "Casinhas", 46: "Figurinhas", 47: "Fichas",
  48: "Marcenaria", 49: "Bijuteria", 50: "Alfa 2", 51: "Creme", 52: "Copa", 53: "Calistenia",
  54: "Religião", 55: "Dinamicas", 56: "Leiturinha", 57: "Anatomia", 58: "Cafajeste",
  59: "Sono", 60: "Painel", 61: "PTBR", 62: "Planilha", 63: "Pro", 64: "Cal 2",
  65: "Português", 66: "2º ano", 67: "Figurinha"
};

console.log('\n=== RESUMO DA COLETA — DIA 1 (25/05/2026) ===\n');
console.log('Produtos coletados com sucesso: ' + coleta.length);
console.log('Total de anúncios encontrados: ' + coleta.reduce((sum, item) => sum + (item.valor || 0), 0));
console.log('\n--- DETALHES POR PRODUTO ---\n');

coleta.forEach(item => {
  const name = produtos_map[item.rowIdx] || `Produto ${item.rowIdx}`;
  console.log(`[${item.rowIdx}] ${name.padEnd(35)} ${item.valor || 0} anúncios`);
});

console.log('\n--- ESTATÍSTICAS ---\n');
const com_anuncios = coleta.filter(c => c.valor > 0).length;
const sem_anuncios = coleta.filter(c => c.valor === 0).length;
const com_valor_alto = coleta.filter(c => c.valor >= 50).length;

console.log(`Produtos com anúncios: ${com_anuncios}/48`);
console.log(`Produtos sem anúncios: ${sem_anuncios}/48`);
console.log(`Produtos com 50+ anúncios: ${com_valor_alto}/48`);
console.log(`Média de anúncios por produto: ${(coleta.reduce((sum, item) => sum + (item.valor || 0), 0) / coleta.length).toFixed(1)}`);

const sorted = [...coleta].sort((a, b) => (b.valor || 0) - (a.valor || 0));
console.log('\n--- TOP 10 PRODUTOS ---\n');
sorted.slice(0, 10).forEach((item, idx) => {
  const name = produtos_map[item.rowIdx] || `Produto ${item.rowIdx}`;
  console.log(`${idx + 1}. ${name} — ${item.valor} anúncios`);
});

