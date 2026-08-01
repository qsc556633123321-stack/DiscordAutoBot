const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_MESSAGE_TEMPLATE_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_REQUEST_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RESULT_CONTRACT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_MAPPING_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_APPLICATION_BOUNDARY.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_COMPATIBILITY_MATRIX.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RUNTIME_INTEGRATION_READINESS.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_PREPARATION_BLOCKERS.md',
  'src/application/community/welcome/CommunityWelcomeDeliveryRequest.js',
  'src/application/community/welcome/CommunityWelcomeDeliveryResult.js',
  'src/application/community/welcome/CommunityWelcomeDeliveryFailureReason.js',
  'src/application/community/welcome/buildCommunityWelcomeMessage.js',
  'src/application/community/welcome/mapLegacyWelcomeDeliveryRequest.js',
  'tests/fixtures/community/community-welcome-delivery-cases.json',
  'tests/application/community/welcome/communityWelcomeDeliveryRequestContract.test.js',
  'tests/application/community/welcome/communityWelcomeDeliveryResultContract.test.js',
  'tests/application/community/welcome/communityWelcomeMessageBuilder.test.js',
  'tests/application/community/welcome/communityWelcomeDeliveryMapping.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const index = fs.readFileSync(path.join(root, 'src/application/community/index.js'), 'utf8');
for (const exported of ['createCommunityWelcomeDeliveryRequest', 'CommunityWelcomeDeliveryFailureReason', 'buildCommunityWelcomeMessage', 'mapLegacyWelcomeDeliveryRequest']) assert.match(index, new RegExp(exported));
assert.match(fs.readFileSync(path.join(root, 'docs/refactor-audit/COMMUNITY_WELCOME_DELIVERY_RUNTIME_INTEGRATION_READINESS.md'), 'utf8'), /Use pure message builder only/i);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/welcome/CommunityWelcomeDeliveryPort.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityWelcomeDeliveryFeature.js')), false);
console.log('community welcome delivery preparation integrity passed');
