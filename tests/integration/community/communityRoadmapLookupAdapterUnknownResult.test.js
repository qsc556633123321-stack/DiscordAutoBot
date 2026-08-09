const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapLookupAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapLookupAdapter');

(async () => {
  for (const result of [null, undefined, {}, { kind: 'Unexpected' }]) {
    const adapter = createFakeProductionShapeRoadmapLookupAdapter({
      resourceSession: { async lookupTrackedMessage() { return result; } }
    });
    await assert.rejects(() => adapter.lookupTrackedMessage({ messageId: 'message' }), /unknown session result/);
  }
  console.log('Roadmap lookup adapter rejects unknown session results');
})().catch((error) => { console.error(error); process.exitCode = 1; });
