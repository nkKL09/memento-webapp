/**
 * Тест WebP: 10 картинок 00–09 из 00-99, quality 90, в папку webp-test/
 */
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');

const srcDir = path.join(__dirname, '..', 'assets', 'images', '00-99');
const outDir = path.join(__dirname, '..', 'webp-test');

const names = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

async function run() {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  for (const name of names) {
    const srcPath = path.join(srcDir, `${name}.jpg`);
    const outPath = path.join(outDir, `${name}.webp`);
    if (!fs.existsSync(srcPath)) {
      console.warn('Пропуск (нет файла):', srcPath);
      continue;
    }
    const stat = fs.statSync(srcPath);
    await sharp(srcPath)
      .webp({ quality: 90 })
      .toFile(outPath);
    const outStat = fs.statSync(outPath);
    const saved = ((1 - outStat.size / stat.size) * 100).toFixed(1);
    console.log(`${name}.jpg → ${name}.webp  ${(stat.size / 1024).toFixed(1)} KB → ${(outStat.size / 1024).toFixed(1)} KB  (−${saved}%)`);
  }
  console.log('\nГотово. Папка: webp-test/');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
