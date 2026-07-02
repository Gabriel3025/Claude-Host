const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const pdfPath = 'C:\Users\Administrador.LAURAFERREIRA\Desktop\Shots_Acelerador_Intestino.pdf';
    const pdfBuffer = fs.readFileSync(pdfPath);
    const data = await pdf(pdfBuffer);
    
    console.log(`Total de páginas no PDF: ${data.numpages}`);
    console.log('\nConteúdo de cada página:');
    
    data.version;
    console.log(`\nVersão PDF: ${data.version}`);
    console.log(`Produtor: ${data.producer}`);
    
  } catch (err) {
    console.error('Erro ao processar PDF:', err.message);
  }
})();
