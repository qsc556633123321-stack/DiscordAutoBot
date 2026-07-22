const assert = require('node:assert/strict');
const { createMemoryFeature } = require('../../src/composition/memoryFeature');

function createRepository() {
  const rules = [];
  return {
    listByGuild: () => rules.map((rule) => ({ ...rule })),
    findByKeyword: (_guildId, keyword) => rules.find((rule) => rule.keyword.toLowerCase() === keyword.toLowerCase()),
    upsert: (_guildId, rule) => {
      rules.push({ ...rule });
      return { ...rule };
    },
    deleteByKeyword: () => false
  };
}

const feature = createMemoryFeature({
  repository: createRepository(),
  clock: () => '2026-07-22T00:00:00.000Z'
});

assert.equal(typeof feature.listChannelRules.execute, 'function');
assert.equal(typeof feature.upsertChannelRule.execute, 'function');
assert.equal(typeof feature.deleteChannelRule.execute, 'function');
assert.equal(feature.upsertChannelRule.execute({ guildId: 'guild', keyword: 'APEX', category: 'Games', weight: 5 }).ok, true);
assert.equal(feature.listChannelRules.execute({ guildId: 'guild' }).length, 1);

console.log('Memory composition tests passed.');
