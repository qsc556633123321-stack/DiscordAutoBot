const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPair } = require('../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const channel = { id: 'guide', messages: { async fetch() { return null; } }, async send() { throw new Error('send rejected'); } };
  const pair = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(await pair.lookupPort.lookup({ messageId: 'tracked' }), { status: 'MessageUnavailable', messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.send({ payload: {} }), { kind: 'Failure', failureKind: 'SendRejected' });
  console.log('Guide adapter pair failure handoff preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
