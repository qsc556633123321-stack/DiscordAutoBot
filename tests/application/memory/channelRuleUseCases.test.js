const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createDeleteChannelRuleUseCase } = require('../../../src/application/memory/deleteChannelRuleUseCase');
const { createGetChannelRulesForOrganizerUseCase } = require('../../../src/application/memory/getChannelRulesForOrganizerUseCase');
const { createListChannelRulesUseCase } = require('../../../src/application/memory/listChannelRulesUseCase');
const { createUpsertChannelRuleUseCase } = require('../../../src/application/memory/upsertChannelRuleUseCase');

function createRepository(seed = []) {
  const rules = [...seed];
  return {
    rules,
    listByGuild: () => rules.map((rule) => ({ ...rule })),
    findByKeyword: (_guildId, keyword) => rules.find((rule) => rule.keyword.trim().toLowerCase() === keyword.trim().toLowerCase()),
    upsert: (_guildId, rule) => {
      const index = rules.findIndex((item) => item.keyword.trim().toLowerCase() === rule.keyword.trim().toLowerCase());
      if (index >= 0) rules[index] = { ...rule };
      else rules.push({ ...rule });
      return { ...rule };
    },
    deleteByKeyword: (_guildId, keyword) => {
      const index = rules.findIndex((rule) => rule.keyword.trim().toLowerCase() === keyword.trim().toLowerCase());
      if (index < 0) return false;
      rules.splice(index, 1);
      return true;
    }
  };
}

for (const factory of [
  createListChannelRulesUseCase,
  createUpsertChannelRuleUseCase,
  createDeleteChannelRuleUseCase
]) {
  assert.throws(() => factory(), /channelRuleRepository is required/);
}

for (const file of ['listChannelRulesUseCase.js', 'upsertChannelRuleUseCase.js', 'deleteChannelRuleUseCase.js']) {
  const source = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'application', 'memory', file), 'utf8');
  assert.equal(source.includes('jsonChannelRuleRepository'), false, `${file} must not import the JSON repository.`);
  assert.equal(source.includes('infrastructure/'), false, `${file} must not import infrastructure.`);
}

const many = Array.from({ length: 30 }, (_, index) => ({ keyword: `rule-${index}`, category: 'Games', weight: 5 }));
assert.equal(createListChannelRulesUseCase({ repository: createRepository(many) }).execute({ guildId: 'guild' }).length, 25);
assert.equal(
  createGetChannelRulesForOrganizerUseCase({ channelRuleReader: createRepository(many) }).execute({ guildId: 'guild' }).length,
  30,
  'Organizer query must not inherit the /memory-list presentation limit.'
);
assert.throws(() => createGetChannelRulesForOrganizerUseCase(), /channelRuleReader is required/);
assert.throws(
  () => createListChannelRulesUseCase({ repository: { listByGuild: () => { throw new Error('repository unavailable'); } } }).execute({ guildId: 'guild' }),
  /repository unavailable/
);

const repository = createRepository();
const upsert = createUpsertChannelRuleUseCase({ repository, clock: () => '2026-01-01T00:00:00.000Z' });
const inserted = upsert.execute({ guildId: 'guild', keyword: ' APEX ', category: 'Games', weight: 5 });
assert.equal(inserted.ok, true);
assert.equal(repository.rules.length, 1);
assert.equal(inserted.data.createdAt, '2026-01-01T00:00:00.000Z');

const update = createUpsertChannelRuleUseCase({ repository, clock: () => '2026-01-02T00:00:00.000Z' }).execute({
  guildId: 'guild', keyword: 'apex', category: 'Updated', weight: 7
});
assert.equal(repository.rules.length, 1);
assert.equal(update.data.createdAt, '2026-01-01T00:00:00.000Z');
assert.equal(update.data.updatedAt, '2026-01-02T00:00:00.000Z');
assert.equal(update.data.category, 'Updated');

const invalid = upsert.execute({ guildId: 'guild', keyword: ' ', category: 'Games', weight: 5 });
assert.equal(invalid.ok, false);
assert.equal(invalid.error.code, 'CHANNEL_RULE_KEYWORD_REQUIRED');

const remove = createDeleteChannelRuleUseCase({ repository });
assert.equal(remove.execute({ guildId: 'guild', keyword: ' APEX ' }).data.deleted, true);
assert.equal(remove.execute({ guildId: 'guild', keyword: 'APEX' }).data.deleted, false);
assert.equal(remove.execute({ guildId: 'guild', keyword: ' ' }).error.code, 'CHANNEL_RULE_KEYWORD_REQUIRED');

const failingRepository = { findByKeyword: () => { throw new Error('repository unavailable'); } };
assert.throws(() => createUpsertChannelRuleUseCase({ repository: failingRepository }).execute({ guildId: 'guild', keyword: 'APEX', category: 'Games', weight: 5 }), /repository unavailable/);

console.log('Memory application tests passed.');
