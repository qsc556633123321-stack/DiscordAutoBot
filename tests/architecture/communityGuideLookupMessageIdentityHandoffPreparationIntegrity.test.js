const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_MESSAGE_LIFECYCLE_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_IDENTITY_HANDOFF_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_IDENTITY_HANDOFF_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_APPLICATION_PURITY_DECISION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_SESSION_RETAINED_MESSAGE_ACCESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_MESSAGE_OPAQUE_HANDLE_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_IDENTITY_HANDOFF_MUTATION_SHORTCUT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RAW_MESSAGE_RESOURCE_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_IDENTITY_CONTINUITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_HANDOFF_UNAVAILABLE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_HANDOFF_REPEATED_LOOKUP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_HANDOFF_ISOLATION.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_MESSAGE_IDENTITY_HANDOFF_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_MESSAGE_IDENTITY_HANDOFF_IMPLEMENTATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_LOOKUP_MESSAGE_IDENTITY_FUTURE_FLOW.md',
  'tests/fakes/community/FakeGuideLookupMessageIdentityHandoff.js',
  'tests/fixtures/community/community-guide-lookup-message-identity-handoff-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);

assert.equal(require('../fixtures/community/community-guide-lookup-message-identity-handoff-cases.json').length, 60);
console.log('Community guide lookup message identity handoff preparation integrity passed');
