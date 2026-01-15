import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 192, 512];
const svgPath = './public/logo.svg';
const outputDir = './public/icons';

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read SVG
const svgBuffer = fs.readFileSync(svgPath);

// Generate each size
async function generateIcons() {
  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}.png`);
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Generated: ${outputPath}`);
  }

  // Generate favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('./public/favicon-32.png');
  console.log('Generated: favicon-32.png');

  // Generate favicon (16x16)
  await sharp(svgBuffer)
    .resize(16, 16)
    .png()
    .toFile('./public/favicon-16.png');
  console.log('Generated: favicon-16.png');

  // Generate apple touch icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('./public/apple-touch-icon.png');
  console.log('Generated: apple-touch-icon.png');

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);
