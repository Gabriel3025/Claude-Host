const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const htmlPath = path.resolve('Shots_Acelerador_Intestino.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  
  await page.pdf({
    path: path.resolve('..', 'Desktop', 'Shots_Acelerador_Intestino.pdf'),
    format: 'A4',
    margin: {
      top: '0.5in',
      right: '0.5in',
      bottom: '0.5in',
      left: '0.5in'
    }
  });
  
  console.log('PDF generated successfully at C:\Users\Administrador.LAURAFERREIRA\Desktop\Shots_Acelerador_Intestino.pdf');
  
  await browser.close();
})();
