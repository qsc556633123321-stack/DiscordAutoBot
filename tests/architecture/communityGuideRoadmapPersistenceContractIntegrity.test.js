const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');
const required = [
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_PERSISTENCE_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_LEGACY_SCHEMA_MAP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_FIELD_OWNERSHIP_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_PERSISTENCE_BEHAVIOR_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_DUPLICATE_PUBLICATION_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_PERSISTENCE_BOUNDARY_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_PERSISTENCE_READINESS_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ROADMAP_PERSISTENCE_COVERAGE.md',
  'tests/fixtures/communityGuideRoadmapPersistenceLegacyBaseline.js',
  'tests/helpers/createCommunityGuideRoadmapPersistenceHarness.js',
  'tests/community/communityGuideRoadmapPersistenceSchemaBaseline.test.js',
  'tests/community/communityGuideRoadmapPersistencePreservationBaseline.test.js',
  'tests/community/communityGuideRoadmapPersistenceReadFailureBaseline.test.js',
  'tests/community/communityGuideRoadmapPersistenceWriteFailureBaseline.test.js',
  'tests/community/communityGuideRoadmapSequentialWriteBaseline.test.js',
  'tests/community/communityGuideRoadmapConcurrentWriteRiskBaseline.test.js'
];
for (const file of required) assert.equal(fs.existsSync(path.join(root, file)), true, `${file} must exist`);

const readiness = fs.readFileSync(path.join(root, required[6]), 'utf8');
assert.match(readiness, /No Persistence Preparation Slice Approved/);
const coverage = fs.readFileSync(path.join(root, required[7]), 'utf8');
for (const name of ['path, root', 'unknown field preservation', 'write failure', 'sequential', 'stale same-guild']) assert.match(coverage, new RegExp(name));

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
for (const token of ['ONBOARDING_FILE', 'readOnboardingData', 'saveOnboarding', 'guideMessageId', 'roadmapMessageId', 'writeFileSync']) assert.match(runtime, new RegExp(token));
assert.equal(fs.existsSync(path.join(root, 'src', 'infrastructure', 'community', 'communityGuideRoadmapPersistenceRepository.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'services', 'community', 'communityGuideRoadmapPersistenceService.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src', 'data', 'onboarding-flows.json')), true);
assert.match(fs.readFileSync(path.join(root, 'src', 'legacy', 'events', 'channelDelete.js'), 'utf8'), /handleTempVoiceChannelDelete/);
console.log('Community Guide/Roadmap persistence contract integrity tests passed.');
