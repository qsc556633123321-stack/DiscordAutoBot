const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(source.includes('lookupPort.lookup'), true);
assert.equal(source.includes('mutationPort.edit'), true);
assert.equal(source.includes('mutationPort.send'), true);
assert.equal(source.includes('saveOnboarding(guild.id'), true);
console.log('Community guide runtime pair creation integration guard passed');
