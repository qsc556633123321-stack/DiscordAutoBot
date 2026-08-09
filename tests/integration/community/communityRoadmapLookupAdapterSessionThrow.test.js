const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapLookupAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapLookupAdapter');

(async () => {
  const failure = new Error('session invariant');
  const adapter = createFakeProductionShapeRoadmapLookupAdapter({
    resourceSession: { async lookupTrackedMessage() { throw failure; } }
  });
  await assert.rejects(() => adapter.lookupTrackedMessage({ messageId: 'message' }), (error) => error === failure);
  console.log('Roadmap lookup adapter propagates session invariant failures');
})().catch((error) => { console.error(error); process.exitCode = 1; });
