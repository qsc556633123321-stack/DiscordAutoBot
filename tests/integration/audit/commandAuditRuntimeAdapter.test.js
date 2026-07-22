const assert = require('node:assert/strict');
const { loadAliases } = require('../../../src/modules/commands/aliasRegistry');
const { getCommandRegistry } = require('../../../src/modules/commands/commandRegistry');
const legacy = require('../../../src/legacy/commands/dev-audit-commands');
const presentation = require('../../../src/presentation/commands/devAuditCommandsCommand');

const aliases = loadAliases();
const registry = getCommandRegistry();
assert.equal(legacy, presentation);
assert.equal(aliases.get('dev-audit-commands'), presentation);
assert.deepEqual(registry.get('dev-audit-commands').data.toJSON(), presentation.data.toJSON());
console.log('Audit runtime adapter tests passed.');
