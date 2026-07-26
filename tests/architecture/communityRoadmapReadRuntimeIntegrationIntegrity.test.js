const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_ROADMAP_READ_RUNTIME_INTEGRATION_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_PUBLICATION_READ_CONSUMER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_READ_INTEGRATION_TARGET_DECISION.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_READ_RUNTIME_BRANCH_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_READ_RUNTIME_OBSERVABLE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_ROADMAP_READ_RUNTIME_ROLLBACK_PLAN.md',
  'tests/community/communityRoadmapReadRuntimeIntegration.test.js',
  'tests/community/communityRoadmapReadRuntimeDifferentialCompatibility.test.js',
  'tests/community/communityGuideReadRuntimeNonRegressionAfterRoadmapIntegration.test.js',
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /publicationState\.roadmap\.messageId \|\| data\.roadmapMessageId/);
assert.equal(/toLegacyPublicationPatch|applyPublicationPatch|CommunityPublicationStateStore/.test(runtime), false);
console.log('community Roadmap read runtime integration integrity passed');
