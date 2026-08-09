const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);
for (const file of changed) {
  assert.equal(file.startsWith('src/'), false, `Preparation slice must not modify production source: ${file}`);
}
console.log('Guide persistence reuse preparation keeps production source diff at zero');
