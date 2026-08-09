const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

(async () => {
  let fetches = 0;
  let edits = 0;
  const message = { id: 'tracked', async edit() { edits += 1; return this; } };
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: {
    id: 'guide', messages: { async fetch() { fetches += 1; return message; } }, async send() {}
  } });
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'tracked', payload: {} }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.equal(fetches, 1);
  assert.equal(edits, 1);
  console.log('Guide Pair retained-message mutation compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
