const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_SESSION_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_PRODUCTION_RESOURCE_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_RESPONSIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_SESSION_INJECTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_EDIT_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_SEND_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_EDIT_SUCCESS_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_SEND_SUCCESS_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_EDIT_FAILURE_MAPPING_SESSION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_SEND_FAILURE_MAPPING_SESSION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_NO_LOOKUP_RULE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_NO_CHANNEL_RESOLUTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_RESOURCE_CONTAINMENT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_ADAPTER_PAIR_SESSION_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MUTATION_ADAPTER_IMPLEMENTATION_READINESS_WITH_SESSION.md',
  'tests/fakes/community/FakeGuidePublicationMessageMutationSessionAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-mutation-adapter-session-cases.json'), 'utf8'));
assert.equal(cases.length, 50);
console.log('Guide mutation adapter session preparation integrity passed');
