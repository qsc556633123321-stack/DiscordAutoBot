const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  const log = { fetch: 0, edit: 0, send: 0 };
  const channel = {
    id: 'roadmap',
    messages: { async fetch() { log.fetch += 1; return null; } },
    async send() { log.send += 1; return { id: 'sent' }; }
  };
  const feature = createCommunityRoadmapAdapterPairFeature();
  feature.createAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(log, { fetch: 0, edit: 0, send: 0 });
  console.log('Roadmap runtime production Pair creation adds no I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
