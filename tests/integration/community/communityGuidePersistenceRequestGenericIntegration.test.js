const assert = require('node:assert/strict');
const { createPersistCommunityPublicationRecordUseCase } = require('../../../src/application/community/persistCommunityPublicationRecordUseCase');
const { createGuidePersistenceRequest, mapGuidePersistenceRequestToGenericInput } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');

let received;
const useCase = createPersistCommunityPublicationRecordUseCase({
  now: () => '2026-08-10T00:00:00.000Z',
  repository: { mergeRecord(input) { received = input; return { persisted: true, record: input.patch }; } }
});
const recommendations = ['entry'];
const excluded = ['voice'];
const input = mapGuidePersistenceRequestToGenericInput(createGuidePersistenceRequest({
  guildId: 'G', channelId: 'C', messageId: 'M',
  nativeTaskRecommendations: recommendations, nativeTaskExcludedChannels: excluded
}));
assert.deepEqual(useCase.execute(input), { persisted: true, record: input.patch });
assert.deepEqual(received, {
  guildId: 'G',
  patch: { guideChannelId: 'C', guideMessageId: 'M', nativeTaskRecommendations: recommendations, nativeTaskExcludedChannels: excluded },
  updatedAt: '2026-08-10T00:00:00.000Z'
});
assert.throws(() => useCase.execute(mapGuidePersistenceRequestToGenericInput(
  createGuidePersistenceRequest({ guildId: '', channelId: 'C', messageId: 'M' })
)), /guildId/);
console.log('Guide persistence request delegates validation and updatedAt ownership to generic persistence.');
