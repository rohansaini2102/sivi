const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/og-image.svg');
const pngPath = path.join(__dirname, '../public/og-image.png');

const svgContent = fs.readFileSync(svgPath, 'utf-8');

sharp(Buffer.from(svgContent))
  .resize(1200, 630)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log('OG image generated successfully at:', pngPath);
  })
  .catch(err => {
    console.error('Error generating OG image:', err);
  });
