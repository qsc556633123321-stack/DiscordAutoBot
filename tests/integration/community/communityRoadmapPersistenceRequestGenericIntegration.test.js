const assert = require('node:assert/strict');
const { createPersistCommunityPublicationRecordUseCase } = require('../../../src/application/community/persistCommunityPublicationRecordUseCase');
const {
  createRoadmapPublicationPersistenceRequest,
  mapRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

let received;
const useCase = createPersistCommunityPublicationRecordUseCase({
  now: () => '2026-08-09T01:00:00.000Z',
  repository: { mergeRecord(input) { received = input; return { persisted: true, record: input.patch }; } }
});
const input = mapRoadmapPublicationPersistenceRequestToGenericInput(
  createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' })
);
const result = useCase.execute(input);
assert.deepEqual(received, {
  guildId: 'G', patch: { roadmapChannelId: 'C', roadmapMessageId: 'M' }, updatedAt: '2026-08-09T01:00:00.000Z'
});
assert.equal(result.persisted, true);
assert.throws(() => useCase.execute(mapRoadmapPublicationPersistenceRequestToGenericInput(
  createRoadmapPublicationPersistenceRequest({ guildId: '', channelId: 'C', messageId: 'M' })
)), /guildId/);
console.log('Roadmap request mapper integrates with generic validation and updatedAt ownership');
