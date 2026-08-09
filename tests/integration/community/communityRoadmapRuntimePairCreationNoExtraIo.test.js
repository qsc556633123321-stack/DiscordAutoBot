const assert = require('node:assert/strict');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

(async () => {
  const log = { fetch: 0, edit: 0, send: 0 };
  const channel = {
    id: 'same-channel',
    messages: { async fetch() { log.fetch += 1; return { id: 'old', async edit() { log.edit += 1; } }; } },
    async send() { log.send += 1; return { id: 'new' }; }
  };
  const feature = createCommunityRoadmapAdapterPairFeature();
  const pair = feature.createAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(log, { fetch: 0, edit: 0, send: 0 });
  assert.equal(pair.lookupPort !== undefined, true);
  assert.equal(typeof pair.getRetainedMessage, 'function');
  await channel.messages.fetch('truthy');
  assert.deepEqual(log, { fetch: 1, edit: 0, send: 0 });
  console.log('Roadmap runtime Pair creation adds zero I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
