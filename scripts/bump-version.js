/**
 * После web-билда увеличивает patch-версию в version.js (0.0.1 -> 0.0.2).
 * Так на главной видно, что билд обновился.
 */
const fs = require('fs');
const path = require('path');

const versionPath = path.join(__dirname, '..', 'version.js');
if (!fs.existsSync(versionPath)) {
  console.warn('bump-version.js: version.js не найден.');
  process.exit(0);
}

let content = fs.readFileSync(versionPath, 'utf8');
const match = content.match(/APP_VERSION = '(\d+)\.(\d+)\.(\d+)'/);
if (!match) {
  console.warn('bump-version.js: не удалось найти версию в version.js');
  process.exit(0);
}

const patch = parseInt(match[3], 10) + 1;
const newVer = `${match[1]}.${match[2]}.${patch}`;
content = content.replace(/APP_VERSION = '[^']+'/, `APP_VERSION = '${newVer}'`);
fs.writeFileSync(versionPath, content, 'utf8');
console.log('Версия обновлена до', newVer);
