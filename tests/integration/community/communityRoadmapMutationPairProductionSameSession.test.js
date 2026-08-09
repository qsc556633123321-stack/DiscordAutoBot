const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  const payload = { embeds: [{ title: 'roadmap' }] };
  const retained = { id: 'M', async edit(value) { assert.strictEqual(value, payload); return { id: 'E' }; } };
  const channel = { id: 'roadmap', messages: { async fetch() { return retained; } }, async send() { throw new Error('not used'); } };
  const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  assert.deepEqual(await pair.mutationPort.edit({ messageId: 'M', payload }), { kind: 'EditSuccess', messageId: 'M' });
  assert.strictEqual(pair.getRetainedMessage(), retained);
  console.log('Roadmap production Pair shares one Session for lookup and edit');
})().catch((error) => { console.error(error); process.exitCode = 1; });
