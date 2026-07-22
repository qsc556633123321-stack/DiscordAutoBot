const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createJsonChannelRuleRepository } = require('../../../src/infrastructure/storage/jsonChannelRuleRepository');

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'discord-memory-repository-'));
const filePath = path.join(directory, 'server-memory.json');

try {
  const repository = createJsonChannelRuleRepository({ filePath });
  assert.deepEqual(repository.listByGuild('guild-a'), []);
  const first = { keyword: 'APEX', category: 'Games', weight: 5, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' };
  repository.upsert('guild-a', first);
  assert.deepEqual(repository.findByKeyword('guild-a', ' apex '), first);
  assert.equal(repository.listByGuild('guild-b').length, 0);

  const updated = { ...first, keyword: 'apex', category: 'Updated Games', weight: 7, updatedAt: '2026-01-02T00:00:00.000Z' };
  repository.upsert('guild-a', updated);
  assert.equal(repository.listByGuild('guild-a').length, 1);
  assert.equal(repository.listByGuild('guild-a')[0].category, 'Updated Games');
  assert.equal(repository.deleteByKeyword('guild-a', 'APEX'), true);
  assert.equal(repository.deleteByKeyword('guild-a', 'APEX'), false);

  fs.writeFileSync(filePath, '{not valid json', 'utf8');
  assert.throws(() => repository.listByGuild('guild-a'), SyntaxError);
  fs.writeFileSync(filePath, '[]', 'utf8');
  assert.throws(() => repository.listByGuild('guild-a'), /Invalid channel rule storage shape/);
} finally {
  fs.rmSync(directory, { recursive: true, force: true });
}

console.log('Memory JSON repository tests passed.');
