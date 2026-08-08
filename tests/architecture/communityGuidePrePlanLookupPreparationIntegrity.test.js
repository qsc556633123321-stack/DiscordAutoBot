const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');

for (const file of [
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_PREPARATION_BLOCKERS.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_MESSAGE_LOOKUP_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_MESSAGE_LOOKUP_STATE_MODEL.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_MESSAGE_LOOKUP_RESULT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_MESSAGE_LOOKUP_PORT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_OWNERSHIP.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_TO_MUTATION_PLAN_MAPPING.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_FORCE_MODE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_MALFORMED_ID_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_ADAPTER_IMPACT.md',
  'docs/refactor-audit/COMMUNITY_GUIDE_PRE_PLAN_LOOKUP_IMPLEMENTATION_READINESS.md',
  'tests/community/communityGuidePrePlanMessageLookupEquivalence.test.js',
  'tests/community/communityGuidePrePlanMessageLookupTiming.test.js',
  'tests/community/communityGuidePrePlanLookupSemanticMismatchResolution.test.js',
  'tests/fixtures/community/community-guide-pre-plan-message-lookup-cases.json'
]) assert.equal(fs.existsSync(path.join(root, file)), true, file);
const cases = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-guide-pre-plan-message-lookup-cases.json'), 'utf8'));
assert.equal(cases.length, 30);
assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
console.log('Guide pre-Plan lookup preparation integrity passed');
