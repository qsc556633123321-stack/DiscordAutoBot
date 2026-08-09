const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

(async () => {
  const message = { id: 'tracked' };
  let fetches = 0;
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: {
    id: 'guide', messages: { async fetch() { fetches += 1; return message; } }, async send() {}
  } });
  const result = await pair.lookupPort.lookup({ messageId: 'tracked' });
  assert.deepEqual(result, { status: 'MessageAvailable', messageId: 'tracked' });
  assert.equal(Object.hasOwn(result, 'message'), false);
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  console.log('Guide Pair retained-message lookup compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
