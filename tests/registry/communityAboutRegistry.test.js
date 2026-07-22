const assert = require('node:assert/strict');
const { loadAliases } = require('../../src/modules/commands/aliasRegistry');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');
const legacy = require('../../src/legacy/commands/community-about');
const presentation = require('../../src/presentation/commands/communityAboutCommand');

const aliases = loadAliases();
assert.equal(aliases.get('community-about'), presentation);
assert.equal(legacy, presentation);
assert.equal(legacy.data, presentation.data);
assert.equal(legacy.execute, presentation.execute);
assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
assert.deepEqual(getCommandRegistry().get('community-about').data.toJSON(), presentation.data.toJSON());
assert.equal(getCommandRegistry().size, 72);
console.log('Community About registry and deploy payload tests passed.');
