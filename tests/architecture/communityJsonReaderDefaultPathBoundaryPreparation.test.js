const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const reader = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingJsonReader.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeDefaultCommunityOnboardingJsonReaderFactoryV2.js'), 'utf8');

for (const removed of ["require('node:path')", "const DATA_DIR = path.join(__dirname, '..', 'data');", "const ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding-flows.json');"]) assert.equal(runtime.includes(removed), false);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\{ filePath: ONBOARDING_FILE, dataDirectory: DATA_DIR \}\)/g) || []).length, 0);
assert.equal((runtime.match(/createCommunityPublicationStateFeature\(\)/g) || []).length, 2);
assert.equal((runtime.match(/createCommunityOnboardingJsonReader\(/g) || []).length, 0);
assert.equal((runtime.match(/createDefaultCommunityOnboardingJsonReader\(\)/g) || []).length, 3);
assert.equal((runtime.match(/createCommunityOnboardingStateReader\(\{ onboardingJsonReader \}\)/g) || []).length, 3);
assert.equal(reader.includes('DEFAULT_DATA_DIRECTORY'), false);
assert.equal(runtime.includes('CommunityOnboardingJsonReaderFactory'), true);
assert.equal(candidate.includes('src/systems'), false);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('createCommunityPublicationStateFeature'), false);
const productionDiff = [
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }),
  execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
].join('\n').trim().split(/\r?\n/).filter(Boolean).sort();
assert.ok(
  productionDiff.every((file) => [
    'src/infrastructure/community/CommunityOnboardingJsonReaderFactory.js',
    'src/systems/communityConcierge.js',
    'src/application/community/communityRoleQuickActionUseCase.js',
    'src/application/community/CommunityConciergeButtonActionResolver.js',
    'src/application/community/ports/CommunityRoleMutationGateway.js',
    'src/composition/communityRoleQuickActionFeature.js',
    'src/infrastructure/discord/communityRoleMutationGateway.js'
  ].includes(file)),
  'default-path boundary guard permits committed truth and approved later Community vertical-slice source files'
);

console.log('JsonReader default-path preparation transitions to the approved final runtime path ownership.');
