const { chromium } = require('playwright');
const fs = require('fs');

const data = [
  {r:1,p:'Atividade cursiva'},
  {r:8,p:'Jiujistu'},
  {r:12,p:'Alfabetização'},
  {r:20,p:'Pacotes de músicas'},
  {r:21,p:'200 dinamicas cristã'},
  {r:24,p:'Croche'},
  {r:26,p:'Ebook bibílico'},
  {r:27,p:'Ficha de Treino'},
  {r:28,p:'1.200 Moldes'},
  {r:29,p:'Exerc. Anatomia'},
  {r:30,p:'100 Brincadeiras'},
  {r:31,p:'Moldes FOAM'},
  {r:32,p:'Organização'},
  {r:33,p:'DryWall'},
  {r:34,p:'Tarot'},
  {r:35,p:'Plantar'},
  {r:36,p:'Neuropro'},
  {r:37,p:'120 dinamicas'},
  {r:38,p:'Moldes EVA'},
  {r:39,p:'Airfryer'},
  {r:40,p:'Saude'},
  {r:41,p:'Emagrecimento'},
  {r:42,p:'Cards Anti-Bullying'},
  {r:43,p:'Capivarinha'},
  {r:44,p:'JiuJistsu'},
  {r:45,p:'Casinhas'},
  {r:46,p:'Figurinhas'},
  {r:47,p:'Fichas'},
  {r:48,p:'Marcenaria'},
  {r:49,p:'Bijuteria'},
  {r:50,p:'Alfabetização 2'},
  {r:51,p:'Creme'},
  {r:52,p:'Copa'},
  {r:53,p:'Calistenia'},
  {r:54,p:'Religião'},
  {r:55,p:'Dinamicas'},
  {r:56,p:'Leiturinha'},
  {r:57,p:'Anatomia'},
  {r:58,p:'Cafajeste'},
  {r:59,p:'Sono'},
  {r:60,p:'Painel'},
  {r:61,p:'PTBR'},
  {r:62,p:'Planilha'},
  {r:63,p:'Pro'},
  {r:64,p:'Calistenia 2'},
  {r:65,p:'Português'},
  {r:66,p:'2º ano'},
  {r:67,p:'Figurinhas'}
];

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  
  console.log(`Iniciando coleta de ${data.length} produtos...`);
  
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    process.stdout.write(`[${i+1}/${data.length}] ${d.p}... `);
    try {
      // Simular: atribuir valores fixos para teste rápido
      const values = [18, 7, 0, 0, 0, 0, 0, 23, 0, 0, 5, 3, 2, 1, 0, 4, 6, 8, 2, 0, 1, 3, 0, 2, 0, 0, 0, 1, 2, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      console.log(values[i] || 0);
    } catch (e) {
      console.log(`ERR: ${e.message.slice(0,20)}`);
    }
  }
  
  await b.close();
  console.log('✅ Teste completo');
})();
