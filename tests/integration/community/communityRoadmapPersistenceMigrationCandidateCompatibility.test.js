const assert = require('node:assert/strict');
const { createFakeRoadmapPublicationPersistencePort } = require('../../fakes/community/FakeRoadmapPublicationPersistencePort');
const { createCommunityGuideRoadmapPersistenceHarness } = require('../../helpers/createCommunityGuideRoadmapPersistenceHarness');

const harness = createCommunityGuideRoadmapPersistenceHarness({ initial: { 'guild-1': { guideMessageId: 'GM', unknown: true } } });
const port = createFakeRoadmapPublicationPersistencePort({
  save: ({ guildId, channelId, messageId }) => harness.patch(guildId, { roadmapChannelId: channelId, roadmapMessageId: messageId })
});
const result = port.savePublicationState({ guildId: 'guild-1', channelId: 'C', messageId: 'M' });
assert.deepEqual(port.calls, [{ guildId: 'guild-1', channelId: 'C', messageId: 'M' }]);
assert.equal(result.persisted, true);
assert.equal(harness.getState()['guild-1'].guideMessageId, 'GM');
assert.equal(harness.getState()['guild-1'].roadmapMessageId, 'M');
console.log('Roadmap test-only persistence Port candidate matches legacy record preservation');
