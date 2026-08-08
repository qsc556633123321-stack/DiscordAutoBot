const assert = require('node:assert/strict');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  const editFailure = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage() { throw new Error('no retained message'); }, async sendMessage() {} } });
  assert.deepEqual(await editFailure.edit({ messageId: 'tracked', payload: {} }), { kind: 'Failure', failureKind: 'EditRejected' });
  const unknownEdit = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage() { throw 'unexpected'; }, async sendMessage() {} } });
  assert.deepEqual(await unknownEdit.edit({ messageId: 'tracked', payload: {} }), { kind: 'Failure', failureKind: 'Unknown' });
  const sendFailure = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage() {}, async sendMessage() { throw new Error('send rejected'); } } });
  assert.deepEqual(await sendFailure.send({ payload: {} }), { kind: 'Failure', failureKind: 'SendRejected' });
  const missingId = createFakeGuidePublicationMessageMutationSessionAdapter({ session: { async editTrackedMessage() {}, async sendMessage() { return {}; } } });
  assert.deepEqual(await missingId.send({ payload: {} }), { kind: 'Failure', failureKind: 'MissingResource' });
  console.log('Guide mutation adapter session failure compatibility preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
