const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPair } = require('../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const a = { id: 'a', messages: { async fetch() { return { id: 'a', async edit() {} }; } }, async send() { return { id: 'a-send' }; } };
  const b = { id: 'b', messages: { async fetch() { return { id: 'b', async edit() {} }; } }, async send() { return { id: 'b-send' }; } };
  const first = createFakeGuidePublicationAdapterPair({ ensuredChannel: a });
  const second = createFakeGuidePublicationAdapterPair({ ensuredChannel: b });
  assert.deepEqual(await first.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'a-send' });
  assert.deepEqual(await second.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'b-send' });
  console.log('Guide adapter pair isolation preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
