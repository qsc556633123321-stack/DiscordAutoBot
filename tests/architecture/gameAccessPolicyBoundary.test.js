const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src', 'domain', 'games', 'gameAccessPolicy.js'), 'utf8');

for (const forbidden of ['discord.js', 'node:fs', "require('../community/permissionMatrix')", 'guild', 'interaction', 'permissionOverwrites']) {
  assert.equal(source.includes(forbidden), false, 'game access policy must not depend on ' + forbidden);
}
assert.match(source, /require\('\.\/gameRegistry'\)/);
assert.match(source, /GAME_PARENT_ROLE_KEY = 'game'/);

console.log('Game access policy architecture boundary test passed.');
