const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function generatePDF() {
  const htmlPath = path.resolve(__dirname, 'Shots_Acelerador_Intestino.html');
  const pdfPath = path.resolve('C:\\Users\\Administrador.LAURAFERREIRA\\Desktop\\Shots_Acelerador_Intestino.pdf');

  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Set viewport for optimal rendering
  await page.setViewportSize({ width: 1200, height: 1600 });

  // Load HTML
  await page.setContent(htmlContent, { waitUntil: 'networkidle' });

  // Generate PDF with print settings
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    margin: {
      top: '15mm',
      bottom: '15mm',
      left: '15mm',
      right: '15mm'
    },
    printBackground: true,
    scale: 1
  });

  await browser.close();

  console.log(`✅ PDF gerado com sucesso: ${pdfPath}`);
}

generatePDF().catch(err => {
  console.error('❌ Erro ao gerar PDF:', err);
  process.exit(1);
});
