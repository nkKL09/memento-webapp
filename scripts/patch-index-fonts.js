/**
 * После expo export --platform web дополняет dist/index.html:
 * - <base href="/"> — чтобы все относительные URL (в т.ч. шрифты) шли от корня домена
 * - <link rel="preload"> для шрифтов иконок (Ionicons, MaterialCommunityIcons)
 * Так иконки корректно отображаются на проде (memento-app.ru) и в Telegram WebView.
 */
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.warn('scripts/patch-index-fonts.js: dist/index.html не найден, пропуск.');
  process.exit(0);
}

function findTtfFiles(dir, names) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      results.push(...findTtfFiles(full, names));
    } else if (e.isFile() && e.name.endsWith('.ttf')) {
      const base = path.basename(e.name, '.ttf').replace(/\.[a-f0-9]+$/, '');
      if (names.some((n) => base.startsWith(n))) {
        const relative = path.relative(distDir, full).replace(/\\/g, '/');
        results.push('/' + relative);
      }
    }
  }
  return results;
}

let html = fs.readFileSync(indexPath, 'utf8');

// 1) Вставить <base href="/"> сразу после <head> (один раз)
if (!html.includes('<base href=')) {
  html = html.replace(/(<head[^>]*>)/i, '$1\n    <base href="/">');
}

// 2) Найти шрифты иконок и добавить preload
const assetsDir = path.join(distDir, 'assets');
if (fs.existsSync(assetsDir)) {
  const fontPaths = findTtfFiles(assetsDir, ['Ionicons', 'MaterialCommunityIcons']);
  const preloads = fontPaths
    .map((href) => `    <link rel="preload" href="${href}" as="font" type="font/ttf" crossorigin="">`)
    .join('\n');
  if (preloads && !html.includes('rel="preload"')) {
    html = html.replace(/(<base href="\/">)/, '$1\n' + preloads);
  }
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('scripts/patch-index-fonts.js: index.html обновлён (base + preload шрифтов).');
