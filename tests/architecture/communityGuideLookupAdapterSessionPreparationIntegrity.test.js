const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_SESSION_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_PRODUCTION_SESSION_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_RESPONSIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_SESSION_INJECTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_SESSION_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_RESULT_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_SKIPPED_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_OPAQUE_ID_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_NO_CHANNEL_RESOLUTION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_RESOURCE_CONTAINMENT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_ADAPTER_IMPLEMENTATION_READINESS.md',
  'tests/fakes/community/FakeGuidePublicationMessageLookupSessionAdapter.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-lookup-adapter-session-cases.json'), 'utf8'));
assert.equal(cases.length, 40);
console.log('Guide lookup adapter session preparation integrity passed');
