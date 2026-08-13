const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const requiredFiles = [
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BASELINE_RUNTIME.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BRANCH_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_MUTATION_COUPLING_BASELINE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BASELINE_COVERAGE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_READINESS_DECISION.md',
  'tests/fixtures/communityGuideMutationLegacyBaseline.js',
  'tests/helpers/createCommunityGuideMutationHarness.js',
  'tests/community/communityGuideSetupCommandBaseline.test.js',
  'tests/community/communityGuideRefreshCommandBaseline.test.js',
  'tests/community/communityGuideExistingMessageRefreshBaseline.test.js',
  'tests/community/communityGuideNewMessagePublishBaseline.test.js',
  'tests/community/communityGuideChannelEnsureBaseline.test.js',
  'tests/community/communityGuideMessagePersistenceBaseline.test.js',
  'tests/community/communityGuidePartialFailureBaseline.test.js',
  'tests/community/communityGuideMutationOrderBaseline.test.js'
];

for (const file of requiredFiles) {
  assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);
}

const branchMatrix = fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BRANCH_MATRIX.md'), 'utf8');
for (let index = 1; index <= 40; index += 1) {
  assert.match(branchMatrix, new RegExp(`G-B${String(index).padStart(2, '0')}`));
}
assert.match(branchMatrix, /Not Applicable/);

const coverage = fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_BASELINE_COVERAGE.md'), 'utf8');
for (let index = 1; index <= 15; index += 1) {
  assert.match(coverage, new RegExp(`G${String(index).padStart(2, '0')}`));
}

const readiness = fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_READINESS_DECISION.md'), 'utf8');
assert.match(readiness, /No Mutation Slice Approved/);
assert.match(readiness, /Guide Status: \*\*Dead \/ No Consumer \/ Not Migrated\*\*/);

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /async function setupCommunityGuide/);
assert.match(runtime, /channel\.messages\.fetch/);
assert.match(runtime, /await message\.edit\(payload\)/);
assert.match(runtime, /await channel\.send\(payload\)/);
assert.doesNotMatch(runtime, /saveOnboarding/);
assert.equal(fs.existsSync(path.join(root, 'src', 'application', 'community', 'communityGuideMutation.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'services', 'community', 'communityGuideMutationService.js')), false);

const channelDelete = fs.readFileSync(path.join(root, 'src/legacy/events/channelDelete.js'), 'utf8');
assert.match(channelDelete, /handleTempVoiceChannelDelete/);

console.log('Community Guide mutation baseline integrity tests passed.');
