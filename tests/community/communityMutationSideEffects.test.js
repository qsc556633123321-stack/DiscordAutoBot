const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /function saveOnboarding/);
assert.match(source, /\.\.\.\(data\[guildId\] \|\| \{\}\)/);
assert.match(source, /writeJson\(ONBOARDING_FILE, data\)/);
assert.match(source, /permissionOverwrites\.set\([^\n]+\.catch\(\(\) => null\)/);
assert.equal(/setTimeout|createWebhook|threads\.create/.test(source), false);
console.log('community mutation side effects passed');
