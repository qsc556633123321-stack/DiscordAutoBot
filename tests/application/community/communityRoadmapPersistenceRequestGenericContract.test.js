const assert = require('node:assert/strict');
const { createPersistCommunityPublicationRecordUseCase } = require('../../../src/application/community/persistCommunityPublicationRecordUseCase');

const calls = [];
const useCase = createPersistCommunityPublicationRecordUseCase({
  now: () => '2026-08-09T00:00:00.000Z',
  repository: { mergeRecord(input) { calls.push(input); return { persisted: true, record: input.patch }; } }
});
const result = useCase.execute({ guildId: 'guild-1', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' } });
assert.equal(calls.length, 1);
assert.deepEqual(calls[0], {
  guildId: 'guild-1', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' }, updatedAt: '2026-08-09T00:00:00.000Z'
});
assert.deepEqual(result, { persisted: true, record: { roadmapChannelId: 'C', roadmapMessageId: 'M' } });
assert.throws(() => useCase.execute({ guildId: '', patch: {} }), /guildId/);
assert.throws(() => useCase.execute({ guildId: 'guild-1', patch: [] }), /patch/);
console.log('Roadmap request preparation confirms the generic persistence use case is synchronous and patch-shaped');
