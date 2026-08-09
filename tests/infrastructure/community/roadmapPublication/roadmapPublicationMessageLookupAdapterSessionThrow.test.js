const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  for (const failure of [new Error('error'), 'error', 7, { failure: true }, null, undefined]) {
    const adapter = createRoadmapPublicationMessageLookupAdapter({
      resourceSession: { async lookupTrackedMessage() { throw failure; } }
    });
    await assert.rejects(() => adapter.lookupTrackedMessage({ messageId: 'message' }), (error) => error === failure);
  }
  console.log('Roadmap production lookup adapter preserves session throw identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
