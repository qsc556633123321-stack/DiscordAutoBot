const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapterPair } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapterPair');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'M', async edit() { calls.edit += 1; return { id: 'E' }; } };
  const channel = {
    id: 'roadmap',
    messages: { async fetch() { calls.fetch += 1; return message; } },
    async send() { calls.send += 1; return { id: 'S' }; }
  };
  const pair = createFakeProductionShapeRoadmapMutationAdapterPair({ ensuredChannel: channel });
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  await pair.lookupPort.lookupTrackedMessage({ messageId: 'M' });
  await pair.mutationPort.edit({ messageId: 'M', payload: {} });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 0 });
  await pair.mutationPort.send({ payload: {} });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  assert.throws(() => createFakeProductionShapeRoadmapMutationAdapterPair({ ensuredChannel: { id: 'bad' } }), /messages\.fetch/);
  console.log('Roadmap mutation Pair candidate adds no Pair I/O, retry, or fallback');
})().catch((error) => { console.error(error); process.exitCode = 1; });
