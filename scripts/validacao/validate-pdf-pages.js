const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

(async () => {
  try {
    const pdfPath = 'C:\Users\Administrador.LAURAFERREIRA\Desktop\Shots_Acelerador_Intestino.pdf';
    
    // Verificar se arquivo existe
    if (!fs.existsSync(pdfPath)) {
      console.error(`Arquivo não encontrado: ${pdfPath}`);
      process.exit(1);
    }
    
    const pdfBytes = fs.readFileSync(pdfPath);
    console.log(`Arquivo PDF lido: ${pdfBytes.length} bytes`);
    
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pageCount = pdfDoc.getPageCount();
    
    console.log(`\n========== VALIDAÇÃO PDF ==========`);
    console.log(`Total de páginas: ${pageCount}`);
    console.log(`\nEstrutura esperada:`);
    console.log(`- Página 1: Header + Intro + Benefits`);
    console.log(`- Página 2: Shot 1 (CONSOLIDADO - deve caber tudo)`);
    console.log(`- Página 3: Shot 2`);
    console.log(`- Página 4: Shot 3`);
    console.log(`- Página 5: Protocolo + Footer`);
    
    pdfDoc.getPages().forEach((page, idx) => {
      const { width, height } = page.getSize();
      console.log(`\nPágina ${idx + 1}: ${width.toFixed(0)}x${height.toFixed(0)}pt`);
    });
    
  } catch (err) {
    console.error('Erro:', err.message);
  }
})();
