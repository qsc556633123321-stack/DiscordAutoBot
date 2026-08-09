const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .split(/\r?\n/).filter(Boolean);
const sourceChanges = changed
  .map((line) => line.slice(3))
  .filter((file) => file.startsWith('src/'));
assert.ok(sourceChanges.every((file) => file === 'src/composition/communityGuidePersistenceFeature.js'));
console.log('Guide persistence reuse implementation changes only the approved Composition feature source.');
