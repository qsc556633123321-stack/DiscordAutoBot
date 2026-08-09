const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapAdapterPairFeature } = require('../../fakes/community/FakeCommunityRoadmapAdapterPairFeature');

(async () => {
  const message = { id: 'M' };
  let fetches = 0;
  const channel = { id: 'roadmap', messages: { async fetch() { fetches += 1; return message; } } };
  const feature = createFakeCommunityRoadmapAdapterPairFeature();
  const first = feature.createAdapterPair({ ensuredChannel: channel });
  const second = feature.createAdapterPair({ ensuredChannel: channel });
  assert.notStrictEqual(first, second);
  assert.equal(first.getRetainedMessage(), null);
  assert.equal(second.getRetainedMessage(), null);
  await first.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.strictEqual(first.getRetainedMessage(), message);
  assert.equal(second.getRetainedMessage(), null);
  assert.equal(fetches, 1);
  console.log('Roadmap composition candidate preserves pair isolation');
})().catch((error) => { console.error(error); process.exitCode = 1; });
