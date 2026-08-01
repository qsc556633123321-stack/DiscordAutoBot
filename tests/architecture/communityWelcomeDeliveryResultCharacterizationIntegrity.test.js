const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_CALLER_INVENTORY.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_STATE_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_LEGACY_RESULT_MAPPING_ANALYSIS.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_FAILURE_REASON_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_COMPATIBILITY_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_OBSERVABLE_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_RUNTIME_READINESS.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_CHARACTERIZATION_COVERAGE.md',
  'tests/fixtures/community/community-welcome-delivery-result-cases.json',
  'tests/community/communityWelcomeDeliveryRuntimeReturnBaseline.test.js',
  'tests/community/communityWelcomeDeliveryThrownSwallowedBaseline.test.js',
  'tests/community/communityWelcomeDeliveryCallerBehaviorBaseline.test.js',
  'tests/community/communityWelcomeDeliveryResultCallCountBaseline.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const fixture = JSON.parse(fs.readFileSync(path.join(root, 'tests/fixtures/community/community-welcome-delivery-result-cases.json'), 'utf8'));
assert.equal(fixture.length, 30);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/welcome/CommunityWelcomeDeliveryPort.js')), false);
console.log('community welcome delivery result characterization integrity passed');
