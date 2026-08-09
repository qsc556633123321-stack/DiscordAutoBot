const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  let fetches = 0;
  const pair = createRoadmapPublicationAdapterPair({
    ensuredChannel: { id: 'channel-id', messages: { async fetch() { fetches += 1; return { id: 'unexpected' }; } }, async send() { return { id: 'sent' }; } }
  });
  for (const messageId of [undefined, null, '', 0, false]) {
    assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId }), { kind: 'Unavailable' });
    assert.equal(pair.getRetainedMessage(), null);
  }
  assert.equal(fetches, 0);
  console.log('Roadmap production adapter pair preserves falsy lookup compatibility');
})().catch((error) => { console.error(error); process.exitCode = 1; });
