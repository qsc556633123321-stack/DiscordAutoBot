const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'M', async edit() { calls.edit += 1; return { id: 'E' }; } };
  const channel = { id: 'roadmap', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() { calls.send += 1; return { id: 'S' }; } };
  const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  await pair.mutationPort.edit({ messageId: 'M', payload: {} });
  await pair.mutationPort.send({ payload: {} });
  pair.getRetainedMessage();
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Roadmap production Pair mutation adds no extra I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
