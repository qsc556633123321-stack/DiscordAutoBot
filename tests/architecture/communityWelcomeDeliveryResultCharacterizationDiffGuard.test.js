const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
assert.equal(/createCommunityWelcomeDeliveryResult|CommunityWelcomeDeliveryFailureReason|DeliveryPort|WelcomeDeliveryAdapter/.test(runtime), false);
assert.equal(fs.existsSync(path.join(root, 'src/application/community/welcome/CommunityWelcomeDeliveryPort.js')), false);
console.log('community welcome delivery result characterization diff guard passed');
