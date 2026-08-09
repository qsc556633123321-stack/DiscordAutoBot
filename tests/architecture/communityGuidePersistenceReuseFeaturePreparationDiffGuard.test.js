const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);
for (const file of changed) {
  if (file.startsWith('src/')) {
    assert.equal(file, 'src/systems/communityConcierge.js', `Unexpected production source change: ${file}`);
  }
}
console.log('Guide persistence reuse preparation permits only the approved runtime consumer redirect');
