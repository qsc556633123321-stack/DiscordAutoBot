const assert = require('node:assert/strict');
const { createPersistCommunityPublicationRecordUseCase } = require('../../../src/application/community/persistCommunityPublicationRecordUseCase');

const calls = [];
const repository = {
  mergeRecord(input) {
    calls.push(input);
    return { persisted: true, record: { ...input.patch, updatedAt: input.updatedAt } };
  }
};
const useCase = createPersistCommunityPublicationRecordUseCase({
  repository,
  now: () => '2026-08-08T00:00:00.000Z'
});

const result = useCase.execute({ guildId: 'guild-1', patch: { guideMessageId: 'message-1' } });
assert.deepEqual(calls, [{
  guildId: 'guild-1',
  patch: { guideMessageId: 'message-1' },
  updatedAt: '2026-08-08T00:00:00.000Z'
}]);
assert.equal(result.persisted, true);
assert.throws(() => useCase.execute({ guildId: ' ', patch: {} }), /guildId/);
assert.throws(() => useCase.execute({ guildId: 'guild-1', patch: null }), /patch/);
assert.throws(() => createPersistCommunityPublicationRecordUseCase(), /repository/i);

console.log('Community publication persistence use-case tests passed.');
