const assert = require('node:assert/strict');
const { createFakeRoadmapPublicationAdapterPair } = require('../../fakes/community/FakeRoadmapPublicationAdapterPair');

(async () => {
  const message = { id: 'M' };
  let fetches = 0;
  const channel = { id: 'same-channel', messages: { async fetch() { fetches += 1; return message; } } };
  const pair = createFakeRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 1);

  const sameChannelPair = createFakeRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  assert.equal(sameChannelPair.getRetainedMessage(), null);
  await sameChannelPair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.strictEqual(sameChannelPair.getRetainedMessage(), message);
  assert.strictEqual(pair.getRetainedMessage(), message);
  assert.equal(fetches, 2);
  console.log('Roadmap adapter pair identity and same-channel isolation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
