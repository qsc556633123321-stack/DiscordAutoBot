const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

(async () => {
  const first = { id: 'A', async edit() { return { id: 'EA' }; } };
  const second = { id: 'B', async edit() { return { id: 'EB' }; } };
  let calls = 0;
  const channel = { id: 'roadmap', messages: { async fetch() { calls += 1; return calls === 1 ? first : second; } }, async send() { return { id: 'S' }; } };
  const a = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  const b = createRoadmapPublicationAdapterPair({ ensuredChannel: channel });
  await a.lookupPort.lookupTrackedMessage({ messageId: 'A' });
  await b.lookupPort.lookupTrackedMessage({ messageId: 'B' });
  await a.mutationPort.edit({ messageId: 'A', payload: {} });
  assert.strictEqual(a.getRetainedMessage(), first);
  assert.strictEqual(b.getRetainedMessage(), second);
  console.log('Roadmap production Pairs retain isolated Session state');
})().catch((error) => { console.error(error); process.exitCode = 1; });
