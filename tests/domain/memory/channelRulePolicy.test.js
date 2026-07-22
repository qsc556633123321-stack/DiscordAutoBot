const assert = require('node:assert/strict');
const { isSameKeyword, keywordKey, normalizeCategory, normalizeKeyword } = require('../../../src/domain/memory/channelRule');
const { createChannelRule, updateChannelRule, validateChannelRuleInput } = require('../../../src/domain/memory/channelRulePolicy');

assert.equal(normalizeKeyword('  APEX  '), 'APEX');
assert.equal(normalizeKeyword('   '), '');
assert.equal(normalizeKeyword(null), '');
assert.equal(normalizeCategory('  Games  '), 'Games');
assert.equal(keywordKey(' Apex '), 'apex');
assert.equal(isSameKeyword('APEX', ' apex '), true);
assert.equal(isSameKeyword('APEX', 'LOL'), false);

assert.equal(validateChannelRuleInput({ keyword: '  ', category: 'Games', weight: 5 }).error.code, 'CHANNEL_RULE_KEYWORD_REQUIRED');
assert.equal(validateChannelRuleInput({ keyword: 'APEX', category: '  ', weight: 5 }).error.code, 'CHANNEL_RULE_CATEGORY_REQUIRED');
assert.equal(validateChannelRuleInput({ keyword: 'APEX', category: 'Games', weight: 0 }).error.code, 'CHANNEL_RULE_WEIGHT_INVALID');

const created = createChannelRule({ keyword: ' APEX ', category: ' Games ', weight: 5 }, '2026-01-01T00:00:00.000Z');
assert.deepEqual(created, {
  ok: true,
  data: { keyword: 'APEX', category: 'Games', weight: 5, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
  meta: {}
});

const updated = updateChannelRule(created.data, { keyword: 'apex', category: 'Updated Games', weight: 8 }, '2026-01-02T00:00:00.000Z');
assert.equal(updated.data.createdAt, '2026-01-01T00:00:00.000Z');
assert.equal(updated.data.updatedAt, '2026-01-02T00:00:00.000Z');
assert.equal(updated.data.keyword, 'apex');
assert.equal(updated.data.weight, 8);

console.log('Memory domain tests passed.');
