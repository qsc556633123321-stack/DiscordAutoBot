const assert = require('assert');
const {
  applyCommunityPublicationOperation,
  clearGuidePublication,
  clearRoadmapPublication,
  loadCommunityPublicationState,
  setGuidePublication,
  setRoadmapPublication,
} = require('../../../src/application/community/communityPublicationStateOperations');
const { createInMemoryCommunityPublicationStateStore } = require('../../helpers/inMemoryCommunityPublicationStateStore');
const { legacyRoot } = require('../../fixtures/communitySharedPublicationStateFrozenFixture');

const store = createInMemoryCommunityPublicationStateStore({ root: legacyRoot });
assert.equal(loadCommunityPublicationState(store, 'guild-1').guide.messageId, 'guide-message');

applyCommunityPublicationOperation(store, setGuidePublication({ guildId: 'guild-1', channelId: 'guide-channel-next', messageId: 'guide-message-next' }));
applyCommunityPublicationOperation(store, setRoadmapPublication({ guildId: 'guild-1', channelId: 'roadmap-channel-next', messageId: 'roadmap-message-next' }));
let nextRoot = store.getRoot();
assert.equal(nextRoot['guild-1'].guideMessageId, 'guide-message-next');
assert.equal(nextRoot['guild-1'].roadmapMessageId, 'roadmap-message-next');
assert.deepEqual(nextRoot['guild-1'].nativeTaskRecommendations, ['entry']);
assert.equal(nextRoot['guild-2'].unknown, 'other-guild');

applyCommunityPublicationOperation(store, clearGuidePublication({ guildId: 'guild-1' }));
applyCommunityPublicationOperation(store, clearRoadmapPublication({ guildId: 'guild-1' }));
nextRoot = store.getRoot();
assert.equal('guideMessageId' in nextRoot['guild-1'], false);
assert.equal('roadmapMessageId' in nextRoot['guild-1'], false);
assert.throws(() => loadCommunityPublicationState({}, 'guild-1'), /requires load and applyPatch/);
assert.throws(() => setGuidePublication({ guildId: 'guild-1', channelId: '', messageId: 'message' }), /channelId/);

console.log('community publication persistence port contract passed');
