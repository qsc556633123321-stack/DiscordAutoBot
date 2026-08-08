const assert = require('node:assert/strict');
const { createCommunityGuideAdapterPairFeature } = require('../../../src/composition/communityGuideAdapterPairFeature');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { calls.edit += 1; return this; } };
  const channel = { id: 'guide', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() { calls.send += 1; return { id: 'sent' }; } };
  const feature = createCommunityGuideAdapterPairFeature();
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  const pair = feature.createAdapterPair({ ensuredChannel: channel });
  assert.equal('session' in pair, false);
  assert.equal(typeof pair.lookupPort.lookup, 'function');
  assert.equal(typeof pair.mutationPort.edit, 'function');
  assert.equal(typeof pair.mutationPort.send, 'function');
  assert.deepEqual(await pair.lookupPort.lookup({ messageId: 'tracked' }), { status: 'MessageAvailable', messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'tracked', payload: {} }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await pair.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'sent' });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Community guide adapter pair composition feature integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
