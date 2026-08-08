const assert = require('node:assert/strict');
const {
  assertGuidePublicationMessageMutationPort,
  createGuidePublicationMessageEditRequest,
  createGuidePublicationMessageSendRequest,
  GuidePublicationMessageMutationFailure,
  createGuidePublicationMessageEditSuccess,
  createGuidePublicationMessageSendSuccess,
  createGuidePublicationMessageMutationFailure
} = require('../../../../src/application/community');

const payload = { embeds: [{ title: 'Guide' }] };
const port = { edit() {}, send() {} };
assert.doesNotThrow(() => assertGuidePublicationMessageMutationPort(port));
assert.throws(() => assertGuidePublicationMessageMutationPort({ edit() {} }), /edit and send/);

const edit = createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', messageId: 'm', payload });
const send = createGuidePublicationMessageSendRequest({ guildId: 'g', channelId: 'c', payload });
assert.deepEqual(edit, { guildId: 'g', channelId: 'c', messageId: 'm', payload });
assert.deepEqual(send, { guildId: 'g', channelId: 'c', payload });
assert.equal(Object.isFrozen(edit), true);
assert.equal(Object.isFrozen(send), true);
assert.equal(edit.payload, payload);
assert.equal(send.payload, payload);
assert.equal('operation' in edit, false);
assert.equal('messageId' in send, false);
for (const field of ['channel', 'message', 'guild', 'saveOnboarding', 'roadmap', 'interaction']) {
  assert.equal(field in edit, false);
  assert.equal(field in send, false);
}
assert.throws(() => createGuidePublicationMessageEditRequest({ channelId: 'c', messageId: 'm', payload }), /guildId/);
assert.throws(() => createGuidePublicationMessageEditRequest({ guildId: 'g', messageId: 'm', payload }), /channelId/);
assert.throws(() => createGuidePublicationMessageEditRequest({ guildId: 'g', channelId: 'c', payload }), /messageId/);
assert.throws(() => createGuidePublicationMessageSendRequest({ channelId: 'c', payload }), /guildId/);
assert.throws(() => createGuidePublicationMessageSendRequest({ guildId: 'g', payload }), /channelId/);
assert.deepEqual(createGuidePublicationMessageEditSuccess({ messageId: 'm' }), { kind: 'EditSuccess', messageId: 'm' });
assert.deepEqual(createGuidePublicationMessageSendSuccess({ messageId: 'generated' }), { kind: 'SendSuccess', messageId: 'generated' });
assert.deepEqual(createGuidePublicationMessageMutationFailure({ failureKind: GuidePublicationMessageMutationFailure.EditRejected }), { kind: 'Failure', failureKind: 'EditRejected' });
console.log('Guide publication message mutation Application port passed');
