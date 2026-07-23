const assert = require('node:assert/strict');
const { loadAliases } = require('../../src/modules/commands/aliasRegistry');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');
const legacy = require('../../src/legacy/commands/community-roadmap');
const presentation = require('../../src/presentation/commands/communityRoadmapCommand');

const aliases = loadAliases();
assert.equal(aliases.get('community-roadmap'), presentation);
assert.equal(legacy, presentation);
assert.equal(legacy.data, presentation.data);
assert.equal(legacy.execute, presentation.execute);
assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
assert.deepEqual(getCommandRegistry().get('community-roadmap').data.toJSON(), presentation.data.toJSON());
assert.equal(getCommandRegistry().size, 72);
console.log('Community Roadmap registry and deploy payload tests passed.');
