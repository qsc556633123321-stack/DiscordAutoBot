const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const event = fs.readFileSync(path.join(root, 'src/events/guildMemberAdd.js'), 'utf8');
const result = fs.readFileSync(path.join(root, 'src/application/community/welcome/CommunityWelcomeDeliveryResult.js'), 'utf8');
const reasons = fs.readFileSync(path.join(root, 'src/application/community/welcome/CommunityWelcomeDeliveryFailureReason.js'), 'utf8');

assert.match(runtime, /async function sendConciergeWelcome\(member\)/);
assert.match(runtime, /mapLegacyWelcomeDeliveryRequest/);
assert.match(runtime, /buildCommunityWelcomeMessage/);
assert.match(runtime, /channels\.cache\.get/);
assert.match(runtime, /channels\.fetch/);
assert.match(runtime, /await member\.send\(payload\)\.catch\(\(\) => null\)/);
assert.match(runtime, /function saveOnboarding/);
assert.match(event, /sendConciergeWelcome/);
assert.match(result, /Delivered/);
assert.match(reasons, /GuideDestinationUnavailable/);
assert.equal(/createCommunityWelcomeDeliveryResult|CommunityWelcomeDeliveryFailureReason/.test(runtime), false);
for (const file of [
  'src/application/community/welcome/CommunityWelcomeDeliveryPort.js',
  'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js',
  'src/composition/communityWelcomeDeliveryFeature.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false, `unexpected ${file}`);
console.log('community welcome delivery result characterization boundary passed');
