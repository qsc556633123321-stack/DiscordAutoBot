const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapAdapterPairFeature } = require('../../fakes/community/FakeCommunityRoadmapAdapterPairFeature');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const channel = {
    id: 'roadmap',
    messages: { async fetch() { calls.fetch += 1; return { id: 'M' }; } },
    async edit() { calls.edit += 1; },
    async send() { calls.send += 1; }
  };
  const feature = createFakeCommunityRoadmapAdapterPairFeature();
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  const pair = feature.createAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  pair.getRetainedMessage();
  assert.deepEqual(calls, { fetch: 1, edit: 0, send: 0 });
  console.log('Roadmap composition candidate adds no extra I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
