const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const architecture = require('../src/domain/community/communityArchitectureV3');
const { isGuestVisible } = require('../src/domain/community/visibilityPolicy');
const { isSameGame } = require('../src/domain/games/gameIdentityService');
const { createLegacyFacade } = require('../src/core/serviceFacade');
const { readJson, updateJson, writeJsonAtomic } = require('../src/infrastructure/storage/jsonStore');
const { auditCommands } = require('./audit-commands');

function assertUnique(items, label) {
  assert.equal(new Set(items).size, items.length, `${label} must be unique`);
}

assert.equal(architecture.version, '3.0.0');
assertUnique(architecture.categories.map((item) => item.key), 'category keys');
assertUnique(architecture.channels.map((item) => item.key), 'channel keys');
assertUnique(architecture.roles.map((item) => item.key), 'role keys');

const guestVisible = architecture.categories.filter(isGuestVisible).map((item) => item.key).sort();
assert.deepEqual(guestVisible, ['entry', 'support']);

assert.equal(isSameGame('VALORANT', '特戰'), true);
assert.equal(isSameGame('VALORANT', '特戰英豪'), true);

const storeTestFile = path.join(os.tmpdir(), `discord-community-os-${process.pid}.json`);
writeJsonAtomic(storeTestFile, { version: 1 });
updateJson(storeTestFile, (data) => ({ ...data, version: 2 }));
assert.equal(readJson(storeTestFile, {}).version, 2);
fs.unlinkSync(storeTestFile);

const facade = createLegacyFacade({ echo: (value) => value }, 'TEST');
assert.equal(typeof facade.invoke, 'function');

const audit = auditCommands();
assert.equal(audit.invalid.length, 0, 'all command files must be loadable');
assert.equal(audit.documentedOnly.length, 0, 'documented slash commands must exist');

console.log(`Architecture V2 tests passed. Commands: ${audit.implemented.length}`);
