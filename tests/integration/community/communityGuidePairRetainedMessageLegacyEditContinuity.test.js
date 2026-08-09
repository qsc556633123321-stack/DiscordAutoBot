const assert = require('node:assert/strict');
const { createGuidePublicationAdapterPair } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationAdapterPairFactory');

(async () => {
  let fetches = 0;
  let edits = 0;
  const message = { id: 'tracked', async edit() { edits += 1; } };
  const pair = createGuidePublicationAdapterPair({ ensuredChannel: {
    id: 'guide', messages: { async fetch() { fetches += 1; return message; } }, async send() {}
  } });
  await pair.lookupPort.lookup({ messageId: 'tracked' });
  const legacyMessage = pair.getRetainedMessage();
  assert.strictEqual(legacyMessage, message);
  await legacyMessage.edit({});
  assert.equal(fetches, 1);
  assert.equal(edits, 1);
  console.log('Guide Pair retained-message legacy edit continuity passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
