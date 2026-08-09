const assert = require('node:assert/strict');
const { createFakeProductionShapeGuidePersistenceFeature } = require('../../fakes/community/FakeProductionShapeGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../../src/application/community/guidePublication/GuidePersistenceRequest');

const recommendations = [{ channel: 'guide' }];
const excluded = ['voice-hub'];
const request = createGuidePersistenceRequest({
  guildId: 'G', channelId: 'C', messageId: 'M',
  nativeTaskRecommendations: recommendations,
  nativeTaskExcludedChannels: excluded
});
const result = { persisted: true, record: { guideMessageId: 'M' } };
let calls = 0;
let input;
const candidate = createFakeProductionShapeGuidePersistenceFeature({
  communityPublicationStateFeature: {
    persistCommunityPublicationRecord: {
      execute(value) { calls += 1; input = value; return result; }
    }
  }
});

assert.strictEqual(candidate.persist(request), result);
assert.equal(calls, 1);
assert.deepEqual(input, {
  guildId: 'G',
  patch: {
    guideChannelId: 'C',
    guideMessageId: 'M',
    nativeTaskRecommendations: recommendations,
    nativeTaskExcludedChannels: excluded
  }
});
assert.strictEqual(input.patch.nativeTaskRecommendations, recommendations);
assert.strictEqual(input.patch.nativeTaskExcludedChannels, excluded);
assert.deepEqual(Object.keys(input.patch), [
  'guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels'
]);
console.log('Guide reuse feature candidate maps one atomic four-field request and returns the exact generic result');
