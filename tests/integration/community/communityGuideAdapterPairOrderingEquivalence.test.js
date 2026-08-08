const assert = require('node:assert/strict');
const { createFakeGuidePublicationAdapterPair } = require('../../fakes/community/FakeGuidePublicationAdapterPairFactory');

(async () => {
  const calls = [];
  const message = { id: 'tracked', async edit() { calls.push('edit'); return this; } };
  const channel = { id: 'guide', messages: { async fetch() { calls.push('lookup'); return message; } }, async send() { calls.push('send'); return { id: 'sent' }; } };
  const pair = createFakeGuidePublicationAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  await pair.mutationPort.edit({ messageId: 'tracked', payload: {} });
  assert.deepEqual(calls, ['lookup', 'edit']);
  console.log('Guide adapter pair ordering equivalence preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
