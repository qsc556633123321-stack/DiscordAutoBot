const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  const message = { id: 'message-id' };
  let fetches = 0;
  const pair = createRoadmapPublicationAdapterPair({
    ensuredChannel: { id: 'channel-id', messages: { async fetch() { fetches += 1; return message; } }, async send() { return { id: 'sent' }; } }
  });
  assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'message-id' }), { kind: 'Available', messageId: 'message-id' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  console.log('Roadmap production adapter pair lookup integration passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
