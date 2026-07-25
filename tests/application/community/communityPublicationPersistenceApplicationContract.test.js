const assert = require('assert');
const {
  applyCommunityPublicationOperation,
  applyOperationToState,
  clearGuidePublication,
  setGuidePublication,
} = require('../../../src/application/community/communityPublicationStateOperations');
const { createCommunityPublicationState } = require('../../../src/domain/community/communityPublicationState');
const { createInMemoryCommunityPublicationStateStore } = require('../../helpers/inMemoryCommunityPublicationStateStore');

const operation = setGuidePublication({ guildId: 'guild-a', channelId: 'channel-a', messageId: 'message-a' });
assert.deepEqual(operation, { type: 'SET_GUIDE_PUBLICATION', guildId: 'guild-a', channelId: 'channel-a', messageId: 'message-a' });
assert.equal(Object.isFrozen(operation), true);
assert.throws(() => clearGuidePublication({ guildId: ' ' }), /guildId/);
assert.throws(() => applyOperationToState(createCommunityPublicationState({ guildId: 'guild-a' }), { type: 'UNKNOWN' }), /unsupported operation/);
assert.throws(() => applyCommunityPublicationOperation(createInMemoryCommunityPublicationStateStore(), { type: 'SET_GUIDE_PUBLICATION' }), /guildId/);

const readFailure = new Error('read failure');
assert.throws(() => applyCommunityPublicationOperation(createInMemoryCommunityPublicationStateStore({ readError: readFailure }), operation), /read failure/);
const writeFailure = new Error('write failure');
const store = createInMemoryCommunityPublicationStateStore({ writeError: writeFailure });
assert.throws(() => applyCommunityPublicationOperation(store, operation), /write failure/);
assert.equal(store.calls.filter((call) => call.type === 'applyPatch').length, 1, 'the contract does not retry or compensate writes');

console.log('community publication persistence application contract passed');
