const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityOnboardingStateReaderV2.js'), 'utf8');

assert.match(runtime, /function ensureFile\(filePath, fallback = '\{\}'\)/);
assert.match(runtime, /function readJson\(filePath, fallback = \{\}\)/);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ filePath: ONBOARDING_FILE, readJson \}\)/g) || []).length, 3);
assert.equal(runtime.includes('readOnboardingData'), false);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('writeFile'), false);
assert.equal(candidate.includes('saveOnboarding'), false);
assert.equal(candidate.includes('persist'), false);
assert.equal(candidate.includes('Object.freeze'), true);
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js')), true);
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
console.log('Onboarding state reader retains its exact delegation while reader-backed adapters are active.');
