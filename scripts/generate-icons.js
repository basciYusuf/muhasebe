const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 32, 64, 192, 512];
const inputFile = path.join(__dirname, '../public/pngegg.png');

async function generateIcons() {
  // favicon.ico için 16x16, 32x32 ve 64x64 PNG'leri oluştur
  const faviconSizes = [16, 32, 64];
  const faviconBuffers = await Promise.all(
    faviconSizes.map(size =>
      sharp(inputFile)
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );

  // PNG'leri ICO formatına dönüştür
  const ico = require('png-to-ico');
  const icoBuffer = await ico(faviconBuffers);
  fs.writeFileSync(path.join(__dirname, '../public/favicon.ico'), icoBuffer);

  // Diğer boyutlardaki PNG'leri oluştur
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../public/logo${size}.png`));
  }

  // Orijinal dosyayı logo.png olarak kopyala
  fs.copyFileSync(inputFile, path.join(__dirname, '../public/logo.png'));

  console.log('Tüm ikonlar oluşturuldu!');
}

generateIcons().catch(console.error); 