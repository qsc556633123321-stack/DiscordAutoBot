const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  for (const rejection of [new Error('error'), 'string', 1, {}, null, undefined]) {
    const pair = createRoadmapPublicationAdapterPair({
      ensuredChannel: { id: 'channel-id', messages: { async fetch() { throw rejection; } }, async send() { return { id: 'sent' }; } }
    });
    assert.deepEqual(await pair.lookupPort.lookupTrackedMessage({ messageId: 'tracked' }), { kind: 'Unavailable' });
    assert.equal(pair.getRetainedMessage(), null);
  }

  const sessionError = new Error('session invariant');
  const channel = { id: 'channel-id' };
  Object.defineProperty(channel, 'messages', { get() { throw sessionError; } });
  assert.throws(() => createRoadmapPublicationAdapterPair({ ensuredChannel: channel }), (error) => error === sessionError);
  console.log('Roadmap production adapter pair preserves rejection and invariant behavior');
})().catch((error) => { console.error(error); process.exitCode = 1; });
