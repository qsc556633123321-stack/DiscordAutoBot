const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /async function sendConciergeWelcome\(member\)/);
assert.match(runtime, /member\.send\(payload\)/);
assert.doesNotMatch(runtime, /saveOnboarding\(guildId, patch\)/);
assert.match(runtime, /mapLegacyWelcomeDeliveryRequest/);
assert.match(runtime, /buildCommunityWelcomeMessage/);
assert.equal(/CommunityWelcomeDeliveryResult|CommunityWelcomeDeliveryFailureReason|DeliveryPort/.test(runtime), false);
for (const forbiddenPath of [
  'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js',
  'src/composition/communityWelcomeDeliveryFeature.js',
  'src/application/community/welcome/CommunityWelcomeDeliveryPort.js'
]) assert.equal(fs.existsSync(path.join(root, forbiddenPath)), false, `unexpected runtime integration ${forbiddenPath}`);
console.log('community welcome delivery preparation diff guard passed');
