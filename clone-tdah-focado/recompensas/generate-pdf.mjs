import playwright from 'playwright';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PAGES_DIR = path.join(__dirname, 'pages');
const OUTPUT_DIR = path.join(__dirname, 'output');

async function generatePdf() {
  try {
    // Create output directory if it doesn't exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // List all HTML files
    const htmlFiles = fs.readdirSync(PAGES_DIR)
      .filter(f => f.endsWith('.html'))
      .sort();

    console.log(`📄 Encontrados ${htmlFiles.length} arquivos HTML`);

    // Launch browser
    const browser = await playwright.chromium.launch({ headless: true });
    console.log('🌐 Browser iniciado');

    // Process each HTML -> PDF
    const pdfPaths = [];

    for (let i = 0; i < htmlFiles.length; i++) {
      const htmlFile = htmlFiles[i];
      const htmlPath = path.join(PAGES_DIR, htmlFile);
      const pdfName = htmlFile.replace('.html', '.pdf');
      const pdfPath = path.join(OUTPUT_DIR, pdfName);

      try {
        const page = await browser.newPage();
        const fileUrl = `file://${htmlPath}`;

        await page.goto(fileUrl, { waitUntil: 'networkidle' });

        await page.pdf({
          path: pdfPath,
          format: 'A4',
          margin: {
            top: '0.5cm',
            right: '0.5cm',
            bottom: '0.5cm',
            left: '0.5cm'
          },
          printBackground: true
        });

        await page.close();
        pdfPaths.push(pdfPath);
        console.log(`✓ ${i + 1}/${htmlFiles.length} ${htmlFile} → ${pdfName}`);
      } catch (err) {
        console.error(`✗ Erro em ${htmlFile}:`, err.message);
      }
    }

    await browser.close();
    console.log(`\n✅ Browser fechado`);

    // Merge PDFs
    console.log(`\n📑 Mergeando ${pdfPaths.length} PDFs...`);
    const mergedPdf = await PDFDocument.create();

    for (const pdfPath of pdfPaths) {
      const pdfBytes = fs.readFileSync(pdfPath);
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPath = path.join(OUTPUT_DIR, 'TDAH-Focado-Kids-Recompensas.pdf');
    const pdfBytes = await mergedPdf.save();
    fs.writeFileSync(mergedPath, pdfBytes);

    console.log(`✓ PDF final criado: ${mergedPath}`);
    console.log(`📊 Tamanho: ${(pdfBytes.length / 1024 / 1024).toFixed(2)}MB`);
    console.log(`📖 Total de páginas: ${mergedPdf.getPageCount()}`);
    console.log(`\n🎉 Sucesso! Seu Sistema de Recompensas está pronto!`);

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

generatePdf();
