import pngToIco from 'png-to-ico';
import fs from 'fs';

async function generateFavicon() {
  const ico = await pngToIco(['./public/favicon-32.png', './public/favicon-16.png']);
  fs.writeFileSync('./public/favicon.ico', ico);
  console.log('Generated: favicon.ico');
}

generateFavicon().catch(console.error);
