const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_LEGACY_CONTINUITY_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_RESPONSIBILITY_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_LIFETIME.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_CREATION_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_MESSAGE_STATE_MACHINE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_LOOKUP_PORT_BRIDGE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_MUTATION_PORT_BRIDGE.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_PER_INVOCATION_ADAPTER_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_SKIP_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_EDIT_CONTINUITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_SEND_CONTINUITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_FAILURE_SEMANTICS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_INVALID_STATE_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_CONCURRENCY_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_ARCHITECTURE_DECISION.md',
  'tests/fakes/community/FakeGuidePublicationResourceSession.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-resource-session-cases.json'), 'utf8'));
assert.equal(cases.length, 50);
console.log('Guide resource session preparation integrity passed');
