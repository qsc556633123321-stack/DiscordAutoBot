const assert = require('node:assert/strict');
const { createCommunityGuideAdapterPairFeature } = require('../../../src/composition/communityGuideAdapterPairFeature');

(async () => {
  const feature = createCommunityGuideAdapterPairFeature();
  const channelA = { id: 'a', messages: { async fetch() { return { id: 'a-message', async edit() {} }; } }, async send() { return { id: 'a-sent' }; } };
  const channelB = { id: 'b', messages: { async fetch() { return { id: 'b-message', async edit() {} }; } }, async send() { return { id: 'b-sent' }; } };
  const pairA = feature.createAdapterPair({ ensuredChannel: channelA });
  const pairB = feature.createAdapterPair({ ensuredChannel: channelB });
  assert.notEqual(pairA, pairB);
  assert.deepEqual(await pairA.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'a-sent' });
  assert.deepEqual(await pairB.mutationPort.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'b-sent' });
  console.log('Community guide adapter pair composition feature isolation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
