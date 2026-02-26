/**
 * После expo export --platform web дополняет dist/index.html:
 * - Скрипт Telegram Web App API первым в <head> (обязательно до остальных скриптов) — иначе в TWA не работают BackButton, HapticFeedback, ready(), disableVerticalSwipes и т.д.
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

// Убрать смешанный контент: все http:// в HTML заменить на https:// (скрипты, стили, ссылки)
html = html.replace(/http:\/\//g, 'https://');

const TELEGRAM_SCRIPT =
  '<script src="https://telegram.org/js/telegram-web-app.js"><\/script>';

// 0) Скрипт Telegram Web App API — первым в <head> (требование документации)
if (!html.includes('telegram.org/js/telegram-web-app.js')) {
  html = html.replace(/(<head[^>]*>)/i, '$1\n    ' + TELEGRAM_SCRIPT);
}

// 1) <base href="/"> — сразу после скрипта Telegram (или после <head>, если скрипта ещё не было)
if (!html.includes('<base href=')) {
  if (html.includes('telegram.org/js/telegram-web-app.js')) {
    html = html.replace(
      /(telegram-web-app\.js"><\/script>)/,
      '$1\n    <base href="/">'
    );
  } else {
    html = html.replace(/(<head[^>]*>)/i, '$1\n    <base href="/">');
  }
}

// 2) Тёмный фон и полоска загрузки снизу — до загрузки бандла нет серого экрана
const INITIAL_STYLES =
  '<style id="initial-load-style">' +
  'html,body,#root{background:#0f1a26;margin:0;min-height:100vh;height:100%}' +
  '#load-bar{position:fixed;bottom:0;left:0;right:0;height:3px;background:rgba(73,192,248,.25);overflow:hidden}' +
  '#load-bar-inner{display:block;height:100%;width:35%;background:#49c0f8;animation:loadmove 1.4s ease-in-out infinite}' +
  '@keyframes loadmove{0%{transform:translateX(-100%)}50%{transform:translateX(280%)}100%{transform:translateX(-100%)}}' +
  '</style>';
if (!html.includes('id="initial-load-style"')) {
  html = html.replace(/(<\/head>)/i, INITIAL_STYLES + '\n    $1');
}
if (!html.includes('id="load-bar"')) {
  html = html.replace(/(<body[^>]*>)/i, '$1\n    <div id="load-bar"><span id="load-bar-inner"></span></div>');
}

// 3) Найти шрифты иконок и добавить preload
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

// 4) Скопировать favicon.ico из assets в dist (если есть)
const faviconSrc = path.join(__dirname, '..', 'assets', 'favicon.ico');
const faviconDest = path.join(distDir, 'favicon.ico');
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, faviconDest);
  console.log('scripts/patch-index-fonts.js: favicon.ico скопирован в dist.');
}

// 5) serve.json для SPA: все неизвестные пути отдавать index.html (нижнее меню, табы и т.д.)
const serveJsonPath = path.join(distDir, 'serve.json');
fs.writeFileSync(
  serveJsonPath,
  JSON.stringify({
    rewrites: [{ source: '**', destination: '/index.html' }],
  }),
  'utf8'
);

console.log('scripts/patch-index-fonts.js: index.html обновлён (http→https, Telegram script, base, тёмный фон, полоска загрузки, preload шрифтов).');
