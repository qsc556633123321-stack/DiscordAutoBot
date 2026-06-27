const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : entry.name.endsWith('.js') ? [full] : [];
  });
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function countMatches(source, pattern) {
  return (source.match(pattern) || []).length;
}

function analyze(file) {
  const source = fs.readFileSync(file, 'utf8');
  return {
    file: rel(file),
    lines: source.split(/\r?\n/).length,
    imports: countMatches(source, /require\(\s*['"][^'"]+['"]\s*\)|import\s+(?:[^'"]+\s+from\s+)?['"][^'"]+['"]/g),
    exports: countMatches(source, /module\.exports|\bexports\.|\bexport\s+(?:async\s+)?(?:function|const|class|\{|\*)/g),
    functions: countMatches(source, /\b(?:async\s+)?function\s+\w+\s*\(|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?[^=]*=>/g)
  };
}

function printTop(title, rows, key) {
  console.log(`\n${title}`);
  console.log('-'.repeat(title.length));
  rows
    .filter((item) => item[key] > 0)
    .sort((a, b) => b[key] - a[key] || b.lines - a.lines)
    .slice(0, 20)
    .forEach((item, index) => {
      console.log(`${String(index + 1).padStart(2, ' ')}. ${item.file} - ${item[key]} (${item.lines} lines)`);
    });
}

const rows = walk(SRC).map(analyze);

console.log(`Complexity report`);
console.log(`Files scanned: ${rows.length}`);
printTop('Largest JS files', rows, 'lines');
printTop('Most imports/requires', rows, 'imports');
printTop('Most exports', rows, 'exports');
printTop('Most functions', rows, 'functions');
