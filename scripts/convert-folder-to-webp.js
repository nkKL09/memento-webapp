/**
 * Конвертирует все JPG и PNG в указанной папке images в WebP quality 90.
 * Сохраняет .webp в ту же папку и удаляет исходные файлы.
 * Использование: node scripts/convert-folder-to-webp.js 00-99
 * Поддерживает вложенные пути: textbook/chapter02
 */
const path = require('path');
const fs = require('fs');

const sharp = require('sharp');

const folderName = process.argv[2];
if (!folderName) {
  console.error('Укажите папку: node scripts/convert-folder-to-webp.js 00-99');
  process.exit(1);
}

const srcDir = path.join(__dirname, '..', 'assets', 'images', folderName);
if (!fs.existsSync(srcDir)) {
  console.error('Папка не найдена:', srcDir);
  process.exit(1);
}

const QUALITY = 90;

async function run() {
  const files = fs.readdirSync(srcDir).filter((f) => {
    const lower = f.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.png');
  });
  if (files.length === 0) {
    console.log('Нет .jpg/.png в папке:', folderName);
    return;
  }

  console.log(`Папка ${folderName}: ${files.length} файлов → WebP ${QUALITY}...\n`);

  for (const file of files) {
    const base = file.replace(/\.(jpg|png)$/i, '');
    const srcPath = path.join(srcDir, file);
    const outPath = path.join(srcDir, `${base}.webp`);

    const stat = fs.statSync(srcPath);
    await sharp(srcPath).webp({ quality: QUALITY }).toFile(outPath);
    const outStat = fs.statSync(outPath);
    fs.unlinkSync(srcPath);

    const saved = ((1 - outStat.size / stat.size) * 100).toFixed(1);
    console.log(`${file} → ${base}.webp  ${(stat.size / 1024).toFixed(1)} KB → ${(outStat.size / 1024).toFixed(1)} KB  (−${saved}%)`);
  }

  console.log('\nГотово. Исходные файлы удалены.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
