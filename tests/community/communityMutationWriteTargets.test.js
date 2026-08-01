const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
for (const token of ['onboarding-flows.json', 'writeFileSync', 'permissionOverwrites.set', 'channel.setParent', 'message.edit', 'channel.send']) assert.match(source, new RegExp(token.replace(/[.]/g, '\\.')));
assert.equal(/createWebhook|threads\.create|\.pin\(|\.unpin\(/.test(source), false);
console.log('community mutation write targets passed');
