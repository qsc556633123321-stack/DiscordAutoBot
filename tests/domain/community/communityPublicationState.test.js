const assert = require('node:assert/strict');
const { createCommunityPublicationState, createGuidePublicationState, createRoadmapPublicationState } = require('../../../src/domain/community/communityPublicationState');

assert.throws(() => createCommunityPublicationState(), /guildId is required/);
const state = createCommunityPublicationState({ guildId: 'guild-1', guide: { channelId: 'guide', messageId: 'message' }, roadmap: { channelId: 'roadmap', messageId: 'roadmap-message' } });
assert.deepEqual(state, { guildId: 'guild-1', guide: { channelId: 'guide', messageId: 'message' }, roadmap: { channelId: 'roadmap', messageId: 'roadmap-message' } });
assert.equal(Object.isFrozen(state), true);
assert.equal(createGuidePublicationState({ channelId: '' }).channelId, null);
assert.equal(createRoadmapPublicationState({ messageId: 1 }).messageId, null);
console.log('Community shared publication state domain tests passed.');
