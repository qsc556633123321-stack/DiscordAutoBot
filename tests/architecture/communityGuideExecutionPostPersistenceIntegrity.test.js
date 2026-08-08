const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_EXECUTION_REQUEST_PERSISTENCE_MIGRATION_IMPACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_EXECUTION_REQUEST_POST_PERSISTENCE_VALUE_ASSESSMENT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_EXECUTION_POST_PERSISTENCE_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_REASSESSMENT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_PORT_INPUT_SUFFICIENCY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_EXECUTION_NEXT_SLICE_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_EXECUTION_REQUEST_FAILURE_SURFACE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_DISCORD_MUTATION_POST_PERSISTENCE_READINESS.md',
  'tests/fixtures/community/community-guide-execution-post-persistence-cases.json',
  'tests/community/communityGuideExecutionPostPersistenceBoundary.test.js',
  'tests/community/communityGuideExecutionRequestPostPersistenceValue.test.js',
  'tests/community/communityGuideDiscordMutationPortInputSufficiency.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-execution-post-persistence-cases.json'), 'utf8')).length, 20);
console.log('Community Guide execution post-persistence integrity passed.');
