const assert = require('assert');
const { applyCommunityPublicationOperation, clearGuidePublication, setRoadmapPublication } = require('../../../src/application/community/communityPublicationStateOperations');
const { createInMemoryCommunityPublicationStateStore } = require('../../helpers/inMemoryCommunityPublicationStateStore');
const { legacyRoot } = require('../../fixtures/communitySharedPublicationStateFrozenFixture');

const original = JSON.parse(JSON.stringify(legacyRoot));
const store = createInMemoryCommunityPublicationStateStore({ root: legacyRoot });
applyCommunityPublicationOperation(store, setRoadmapPublication({ guildId: 'guild-1', channelId: 'roadmap-new-channel', messageId: 'roadmap-new-message' }));
applyCommunityPublicationOperation(store, clearGuidePublication({ guildId: 'guild-1' }));
const next = store.getRoot();

assert.deepEqual(legacyRoot, original, 'all persistence preparation operations are immutable');
assert.equal(next['guild-1'].roadmapMessageId, 'roadmap-new-message');
assert.deepEqual(next['guild-1'].nativeTaskRecommendations, ['entry']);
assert.deepEqual(next['guild-1'].unknown, original['guild-1'].unknown);
assert.deepEqual(next['guild-2'], original['guild-2']);
assert.equal('guideChannelId' in next['guild-1'], false);

console.log('community publication persistence boundary preservation passed');
