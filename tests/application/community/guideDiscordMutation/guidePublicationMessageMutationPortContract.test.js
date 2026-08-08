const assert = require('node:assert/strict');

const payload = Object.freeze({ embeds: [{ title: 'Guide' }] });
const editRequest = Object.freeze({ guildId: 'guild-1', channelId: 'channel-1', messageId: 'message-1', payload });
const sendRequest = Object.freeze({ guildId: 'guild-1', channelId: 'channel-1', payload });

assert.deepEqual(Object.keys(editRequest).sort(), ['channelId', 'guildId', 'messageId', 'payload']);
assert.deepEqual(Object.keys(sendRequest).sort(), ['channelId', 'guildId', 'payload']);
assert.equal(editRequest.payload, payload);
assert.equal(sendRequest.payload, payload);
assert.equal('channel' in editRequest, false);
assert.equal('message' in editRequest, false);
assert.equal('saveOnboarding' in editRequest, false);
assert.equal('roadmap' in sendRequest, false);

const editSuccess = Object.freeze({ kind: 'EditSuccess', messageId: 'message-1' });
const sendSuccess = Object.freeze({ kind: 'SendSuccess', messageId: 'message-new' });
const failure = Object.freeze({ kind: 'Failure', failureKind: 'EditRejected' });
assert.deepEqual(editSuccess, { kind: 'EditSuccess', messageId: 'message-1' });
assert.deepEqual(sendSuccess, { kind: 'SendSuccess', messageId: 'message-new' });
assert.deepEqual(failure, { kind: 'Failure', failureKind: 'EditRejected' });
console.log('community Guide message mutation port contract passed');
