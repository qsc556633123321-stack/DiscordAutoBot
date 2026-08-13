const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.match(runtime, /mapLegacyWelcomeDeliveryRequest/);
assert.match(runtime, /buildCommunityWelcomeMessage/);
assert.match(runtime, /const request = mapLegacyWelcomeDeliveryRequest\(\{/);
assert.match(runtime, /const payload = buildCommunityWelcomeMessage\(request, \{ guildName: member\.guild\.name \}\)/);
assert.match(runtime, /await member\.send\(payload\)\.catch\(\(\) => null\)/);
assert.match(runtime, /channels\.cache\.get\(data\.guideChannelId\)/);
assert.match(runtime, /channels\.fetch\(data\.guideChannelId\)/);
assert.match(runtime, /if \(!guideChannel\) return/);
assert.doesNotMatch(runtime, /function saveOnboarding\(guildId, patch\)/);
assert.equal(/CommunityWelcomeDeliveryResult|CommunityWelcomeDeliveryFailureReason|DeliveryPort|Discord.*Adapter/.test(runtime), false);
for (const file of [
  'src/application/community/welcome/CommunityWelcomeDeliveryPort.js',
  'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js',
  'src/composition/communityWelcomeDeliveryFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, `unexpected ${file}`);
console.log('community welcome message builder runtime boundary passed');
