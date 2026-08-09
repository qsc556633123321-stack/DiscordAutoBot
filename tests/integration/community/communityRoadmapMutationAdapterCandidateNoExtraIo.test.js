const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  const calls = { retained: 0, failure: 0, edit: 0, send: 0, fetch: 0 };
  const adapter = createFakeProductionShapeRoadmapMutationAdapter({
    resourceSession: {
      getRetainedMessage() { calls.retained += 1; return { id: 'M' }; },
      getRetainedMutationFailure() { calls.failure += 1; return { hasFailure: false }; },
      async editTrackedMessage() { calls.edit += 1; },
      async sendMessage() { calls.send += 1; return { id: 'S' }; },
      async lookupTrackedMessage() { calls.fetch += 1; }
    }
  });
  await adapter.edit({ messageId: 'M', payload: {} });
  await adapter.send({ payload: {} });
  assert.deepEqual(calls, { retained: 1, failure: 0, edit: 1, send: 1, fetch: 0 });
  console.log('Roadmap mutation adapter candidate adds no extra I/O or retry');
})().catch((error) => { console.error(error); process.exitCode = 1; });
