const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  for (const result of [null, undefined, {}, { kind: 'What' }]) {
    const adapter = createRoadmapPublicationMessageLookupAdapter({
      resourceSession: { async lookupTrackedMessage() { return result; } }
    });
    await assert.rejects(() => adapter.lookupTrackedMessage({ messageId: 'message' }), /unknown session result/);
  }
  console.log('Roadmap production lookup adapter rejects unknown results');
})().catch((error) => { console.error(error); process.exitCode = 1; });
