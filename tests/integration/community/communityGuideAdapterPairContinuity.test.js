const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPair } = require('../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const counts = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { counts.edit += 1; return this; } };
  const channel = { id: 'guide', messages: { async fetch() { counts.fetch += 1; return message; } }, async send() { counts.send += 1; return { id: 'sent' }; } };
  const pair = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  await pair.mutationPort.edit({ messageId: 'tracked', payload: {} });
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 0 });
  const sendPair = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  await sendPair.mutationPort.send({ payload: {} });
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 1 });
  console.log('Guide adapter pair continuity preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
