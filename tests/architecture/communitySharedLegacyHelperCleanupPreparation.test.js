const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityOnboardingStateReader.js'), 'utf8');

assert.equal(candidate.includes('node:fs'), false);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('writeFile'), false);
assert.equal(candidate.includes('saveOnboarding'), false);
assert.equal((runtime.match(/function readOnboardingData\(/g) || []).length, 1);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1);
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => file === 'src/infrastructure/community/CommunityOnboardingStateReader.js'), true);
console.log('Shared legacy helper cleanup preparation keeps runtime ownership unchanged while the reader remains unwired.');
