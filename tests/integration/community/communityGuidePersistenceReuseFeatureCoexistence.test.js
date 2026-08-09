const assert = require('node:assert/strict');
const { createPersistCommunityPublicationRecordUseCase } = require('../../../src/application/community/persistCommunityPublicationRecordUseCase');
const { createFakeProductionShapeGuidePersistenceFeature } = require('../../fakes/community/FakeProductionShapeGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createRoadmapPublicationPersistenceRequest, mapRoadmapPublicationPersistenceRequestToGenericInput } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

function runSequence(firstGuide) {
  const root = {
    G: { welcome: { keep: true }, unknown: 'keep' },
    other: { guideMessageId: 'other' }
  };
  const useCase = createPersistCommunityPublicationRecordUseCase({
    now: () => 'STAMP',
    repository: { mergeRecord({ guildId, patch, updatedAt }) {
      const record = { ...(root[guildId] || {}), ...patch, updatedAt };
      root[guildId] = record;
      return { persisted: true, record };
    } }
  });
  const generic = { persistCommunityPublicationRecord: useCase };
  const guide = createFakeProductionShapeGuidePersistenceFeature({ communityPublicationStateFeature: generic });
  const guideRequest = createGuidePersistenceRequest({
    guildId: 'G', channelId: 'G-C', messageId: 'G-M',
    nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice']
  });
  const roadmap = () => useCase.execute(mapRoadmapPublicationPersistenceRequestToGenericInput(
    createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'R-C', messageId: 'R-M' })
  ));
  if (firstGuide) { guide.persist(guideRequest); roadmap(); } else { roadmap(); guide.persist(guideRequest); }
  return root;
}

for (const root of [runSequence(true), runSequence(false)]) {
  assert.equal(root.G.guideChannelId, 'G-C');
  assert.equal(root.G.guideMessageId, 'G-M');
  assert.equal(root.G.roadmapChannelId, 'R-C');
  assert.equal(root.G.roadmapMessageId, 'R-M');
  assert.deepEqual(root.G.welcome, { keep: true });
  assert.equal(root.G.unknown, 'keep');
  assert.deepEqual(root.other, { guideMessageId: 'other' });
  assert.equal(root.G.updatedAt, 'STAMP');
}
console.log('Guide reuse candidate preserves Roadmap, welcome, unknown, other-guild, and generic updatedAt semantics');
