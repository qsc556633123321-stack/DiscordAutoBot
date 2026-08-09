const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean)
  .map((line) => line.slice(3))
  .filter((file) => file.startsWith('src/'));
assert.ok(changed.every((file) => file === 'src/systems/communityConcierge.js'));
console.log('Guide runtime persistence redirect modifies only the approved runtime source.');
