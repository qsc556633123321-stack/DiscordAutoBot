const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPair } = require('../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const message = { id: 'tracked', async edit() { return this; } };
  const channel = { id: 'guide', messages: { async fetch() { return message; } }, async send() { return { id: 'generated' }; } };
  const pair = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'tracked', payload: {} }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'generated' });
  console.log('Guide adapter pair persistence handoff preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
