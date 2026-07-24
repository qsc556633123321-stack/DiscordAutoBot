const assert = require('node:assert/strict');
const { loadAliases } = require('../../src/modules/commands/aliasRegistry');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');
const legacy = require('../../src/legacy/commands/help-me-start');
const presentation = require('../../src/presentation/commands/helpMeStartCommand');

const aliases = loadAliases();
assert.equal(aliases.get('help-me-start'), presentation);
assert.equal(legacy, presentation);
assert.equal(legacy.data, presentation.data);
assert.equal(legacy.execute, presentation.execute);
assert.deepEqual(getCommandRegistry().get('help-me-start').data.toJSON(), presentation.data.toJSON());
assert.equal(getCommandRegistry().size, 72);
console.log('Help-me-start registry and deploy payload tests passed.');
