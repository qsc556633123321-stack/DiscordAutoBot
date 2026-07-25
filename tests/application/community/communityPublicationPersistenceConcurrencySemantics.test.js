const assert = require('assert');
const { applyPublicationPatch } = require('../../../src/application/community/applyPublicationPatch');
const { createCommunityPublicationState } = require('../../../src/domain/community/communityPublicationState');
const { legacyRoot } = require('../../fixtures/communitySharedPublicationStateFrozenFixture');

const guideWriter = createCommunityPublicationState({ guildId: 'guild-1', guide: { channelId: 'guide-1', messageId: 'guide-1' } });
const roadmapWriter = createCommunityPublicationState({ guildId: 'guild-1', roadmap: { channelId: 'roadmap-1', messageId: 'roadmap-1' } });
const firstWrite = applyPublicationPatch(legacyRoot, guideWriter);
const staleSecondWrite = applyPublicationPatch(legacyRoot, roadmapWriter);

assert.equal(firstWrite['guild-1'].guideMessageId, 'guide-1');
assert.equal(staleSecondWrite['guild-1'].roadmapMessageId, 'roadmap-1');
assert.equal(staleSecondWrite['guild-1'].guideMessageId, 'guide-message');
assert.deepEqual(staleSecondWrite['guild-1'].nativeTaskRecommendations, ['entry']);
console.log('community publication persistence concurrency semantics passed');
