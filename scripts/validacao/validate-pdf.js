const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

(async () => {
  const pdfPath = 'C:\Users\Administrador.LAURAFERREIRA\Desktop\Shots_Acelerador_Intestino.pdf';
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  
  const pageCount = pdfDoc.getPageCount();
  console.log(`Total de páginas: ${pageCount}`);
  
  pdfDoc.getPages().forEach((page, idx) => {
    const { width, height } = page.getSize();
    console.log(`Página ${idx + 1}: ${width.toFixed(0)}x${height.toFixed(0)}pt`);
  });
})();
