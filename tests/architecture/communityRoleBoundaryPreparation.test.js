const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityRoleQuickActionCandidate.js'), 'utf8');
assert.equal(runtime.includes('async function maybeAddRole'), true);
assert.equal(runtime.includes('async function handleConciergeButton'), true);
assert.equal((runtime.match(/maybeAddRole\(interaction\.member,/g) || []).length, 2);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 1);
assert.equal((runtime.match(/member\.roles\.remove\(/g) || []).length, 0);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('src/'), false);
assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim(), '');
console.log('Community role boundary preparation freezes current Runtime ownership with no production source changes.');
