const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? jsFiles(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

const files = jsFiles(SRC);
const source = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const candidates = files
  .filter((file) => file.includes(`${path.sep}systems${path.sep}`) || file.includes(`${path.sep}services${path.sep}`))
  .filter((file) => {
    const relative = path.relative(path.dirname(file), file).replace(/\\/g, '/').replace(/\.js$/, '');
    const basename = path.basename(file, '.js');
    return !source.includes(`/${basename}')`) && !source.includes(`/${basename}")`) && !source.includes(relative);
  })
  .map((file) => path.relative(ROOT, file).replace(/\\/g, '/'));

console.log(`Scanned JS files: ${files.length}`);
console.log(`Potential dead modules: ${candidates.length}`);
for (const file of candidates.slice(0, 50)) console.log(`POTENTIAL_DEAD ${file}`);
console.log('Dead-code audit is advisory; legacy aliases are intentionally retained.');
