const assert = require('node:assert/strict');
const { createCommunityGuidePersistenceFeature } = require('../../src/composition/communityGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../src/application/community/guidePublication/GuidePersistenceRequest');

let calls = 0;
let input;
const feature = createCommunityGuidePersistenceFeature({
  communityPublicationStateFeature: {
    persistCommunityPublicationRecord: {
      execute(value) { calls += 1; input = value; return { persisted: true, record: value.patch }; }
    }
  }
});
feature.persist(createGuidePersistenceRequest({
  guildId: 'G', channelId: 'C', messageId: 'M',
  nativeTaskRecommendations: ['R'], nativeTaskExcludedChannels: ['X']
}));
assert.equal(calls, 1);
assert.deepEqual(Object.keys(input.patch), [
  'guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels'
]);
console.log('Guide persistence reuse feature delegates one atomic four-field generic patch.');
