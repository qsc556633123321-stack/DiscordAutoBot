const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean)
  .map((line) => line.slice(3));
assert.equal(changed.some((file) => file.startsWith('src/')), false);
console.log('Guide runtime persistence redirect preparation has zero production source diff.');
