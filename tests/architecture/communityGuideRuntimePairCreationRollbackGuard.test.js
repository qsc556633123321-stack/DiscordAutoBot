const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(source.includes('lookupPort.lookup'), false);
assert.equal(source.includes('mutationPort.edit'), false);
assert.equal(source.includes('mutationPort.send'), false);
assert.equal(source.includes('saveOnboarding(guild.id'), true);
console.log('Community guide runtime pair creation rollback guard passed');
