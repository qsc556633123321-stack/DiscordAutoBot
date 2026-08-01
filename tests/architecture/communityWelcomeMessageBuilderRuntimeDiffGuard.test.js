const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const welcomeRuntime = runtime.slice(runtime.indexOf('async function sendConciergeWelcome'), runtime.indexOf('module.exports'));
assert.match(runtime, /require\('\.\.\/application\/community'\)/);
assert.match(welcomeRuntime, /await member\.send\(payload\)\.catch\(\(\) => null\)/);
assert.equal(/channels\.create|saveOnboarding\(|permissionOverwrites|DeliveryPort|WelcomeDeliveryAdapter/.test(welcomeRuntime), false);
for (const file of [
  'src/infrastructure/community/discordCommunityWelcomeDeliveryAdapter.js',
  'src/composition/communityWelcomeDeliveryFeature.js',
  'src/application/community/welcome/CommunityWelcomeDeliveryPort.js'
]) assert.equal(fs.existsSync(path.join(root, file)), false);
console.log('community welcome message builder runtime diff guard passed');
