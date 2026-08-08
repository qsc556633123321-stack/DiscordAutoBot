const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_BOUNDARY_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_LIFECYCLE_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_BOUNDARY_CANDIDATES.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_OPAQUE_HANDLE_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_SESSION_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_ENSURE_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_LOOKUP_REUSE_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_MUTATION_REUSE_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_MESSAGE_RESOURCE_CONTINUITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_RESOURCE_CAPABILITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_APPLICATION_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_CHANNEL_RESOURCE_BOUNDARY_DECISION.md'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-channel-resource-boundary-cases.json'), 'utf8'));
assert.equal(cases.length, 40);
console.log('Guide channel resource boundary integrity passed');
