const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const required = [
  'docs/refactor-audit/COMMUNITY_LEGACY_PERSISTENCE_WRITER_SEARCH_SCOPE.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_PERSISTENCE_WRITER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_PERSISTENCE_WRITER_CALL_GRAPH.md',
  'docs/refactor-audit/COMMUNITY_ONBOARDING_ROOT_FIELD_OWNERSHIP_MAP.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_PERSISTENCE_WRITER_OPERATION_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_WRITER_PAIR_COEXISTENCE_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_PERSISTENCE_FAILURE_WINDOW_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_SHARED_PERSISTENCE_WRITER_CAPABILITY_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_WRITER_REPLACEMENT_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_WRITER_COEXISTENCE_READINESS_DECISION.md',
  'docs/refactor-audit/COMMUNITY_LEGACY_WRITER_COEXISTENCE_COVERAGE.md',
  'tests/fixtures/communityLegacyPersistenceWriterCoexistenceBaseline.js',
  'tests/helpers/createCommunityLegacyPersistenceWriterHarness.js',
];
for (const file of required) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);

const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /function saveOnboarding/);
assert.match(runtime, /writeJson\(ONBOARDING_FILE, data\)/);
for (const forbidden of [
  'src/infrastructure/community/communityPublicationStateFilesystemAdapter.js',
  'src/composition/communityPublicationStateFeature.js',
]) assert.equal(fs.existsSync(path.join(root, forbidden)), false, `unexpected production integration: ${forbidden}`);
console.log('community legacy persistence writer coexistence integrity passed');
