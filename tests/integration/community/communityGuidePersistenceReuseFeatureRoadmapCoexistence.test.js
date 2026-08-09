const assert = require('node:assert/strict');
const { createCommunityGuidePersistenceFeature } = require('../../../src/composition/communityGuidePersistenceFeature');
const { createCommunityPublicationStateFeature } = require('../../../src/composition/communityPublicationStateFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createRoadmapPublicationPersistenceRequest, mapRoadmapPublicationPersistenceRequestToGenericInput } = require('../../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

function persistInOrder(guideFirst) {
  const records = { G: { welcome: { keep: true }, unknown: true }, other: { keep: true } };
  const generic = createCommunityPublicationStateFeature({
    repository: { mergeRecord(input) {
      records[input.guildId] = { ...records[input.guildId], ...input.patch, updatedAt: input.updatedAt };
      return { persisted: true, record: records[input.guildId] };
    } },
    now: () => 'STAMP'
  });
  const guide = createCommunityGuidePersistenceFeature({ communityPublicationStateFeature: generic });
  const saveGuide = () => guide.persist(createGuidePersistenceRequest({
    guildId: 'G', channelId: 'G-C', messageId: 'G-M',
    nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice']
  }));
  const saveRoadmap = () => generic.persistCommunityPublicationRecord.execute(
    mapRoadmapPublicationPersistenceRequestToGenericInput(
      createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'R-C', messageId: 'R-M' })
    )
  );
  if (guideFirst) { saveGuide(); saveRoadmap(); } else { saveRoadmap(); saveGuide(); }
  return records;
}

for (const records of [persistInOrder(true), persistInOrder(false)]) {
  assert.equal(records.G.guideChannelId, 'G-C');
  assert.equal(records.G.guideMessageId, 'G-M');
  assert.equal(records.G.roadmapChannelId, 'R-C');
  assert.equal(records.G.roadmapMessageId, 'R-M');
  assert.deepEqual(records.G.welcome, { keep: true });
  assert.equal(records.G.unknown, true);
  assert.deepEqual(records.other, { keep: true });
  assert.equal(records.G.updatedAt, 'STAMP');
}
console.log('Guide production reuse feature preserves Roadmap, welcome, unknown, and other-guild coexistence.');
