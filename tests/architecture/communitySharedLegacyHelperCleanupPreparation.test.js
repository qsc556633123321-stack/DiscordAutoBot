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
assert.equal((runtime.match(/function readOnboardingData\(/g) || []).length, 0);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 0);
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => [
  'src/infrastructure/community/CommunityOnboardingStateReader.js',
  'src/infrastructure/community/CommunityOnboardingJsonReader.js',
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js',
  'src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter.js',
  'src/systems/communityConcierge.js'
].includes(file)), true);
console.log('Shared legacy helper cleanup preparation confirms both helpers are retained while reader-backed adapters are active.');
