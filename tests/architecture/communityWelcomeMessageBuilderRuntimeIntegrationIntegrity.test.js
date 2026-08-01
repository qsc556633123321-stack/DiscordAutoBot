const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
for (const file of [
  'docs/refactor-audit/COMMUNITY_WELCOME_MESSAGE_BUILDER_RUNTIME_INPUT_AUDIT.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_MESSAGE_BUILDER_RUNTIME_TARGET_DECISION.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_MESSAGE_BUILDER_RUNTIME_OBSERVABLE_COMPATIBILITY.md',
  'docs/refactor-audit/COMMUNITY_WELCOME_MESSAGE_BUILDER_RUNTIME_ROLLBACK_PLAN.md',
  'tests/fixtures/community/community-welcome-message-runtime-baseline.json',
  'tests/community/communityWelcomeMessageBuilderRuntimePreIntegrationBaseline.test.js',
  'tests/community/communityWelcomeMessageBuilderRuntimeIntegration.test.js',
  'tests/community/communityWelcomeMessageBuilderRuntimeDifferentialCompatibility.test.js',
  'tests/community/communityChannelLookupNonRegressionAfterWelcomeBuilderIntegration.test.js',
  'tests/community/communityWelcomeMessageBuilderRuntimeCallCount.test.js',
  'tests/architecture/communityWelcomeMessageBuilderRuntimeBoundary.test.js',
  'tests/architecture/communityWelcomeMessageBuilderRuntimeDiffGuard.test.js'
]) assert.equal(fs.existsSync(path.join(root, file)), true, `missing ${file}`);
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /mapLegacyWelcomeDeliveryRequest/);
assert.match(runtime, /buildCommunityWelcomeMessage/);
assert.equal(/CommunityWelcomeDeliveryResult|CommunityWelcomeDeliveryFailureReason/.test(runtime), false);
assert.equal(fs.existsSync(path.join(root, 'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js')), false);
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityWelcomeDeliveryFeature.js')), false);
console.log('community welcome message builder runtime integration integrity passed');
