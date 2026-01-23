import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
}

// Read the Elly SVG
const ellySvg = readFileSync(join(publicDir, 'soft_happy_elli.svg'));

// Favicon sizes
const sizes = [16, 32, 72, 96, 128, 144, 192, 512];

async function generateFavicons() {
  console.log('Generating favicons from Elly SVG...');

  for (const size of sizes) {
    const outputPath = size <= 32
      ? join(publicDir, `favicon-${size}.png`)
      : join(iconsDir, `icon-${size}.png`);

    await sharp(ellySvg)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated ${size}x${size} icon`);
  }

  // Generate apple-touch-icon (180x180)
  await sharp(ellySvg)
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon (180x180)');

  console.log('\nAll favicons generated successfully!');
}

generateFavicons().catch(console.error);
