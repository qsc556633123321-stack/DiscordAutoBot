const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  const adapter = createRoadmapPublicationMessageLookupAdapter({
    resourceSession: { async lookupTrackedMessage() { return { kind: 'Unavailable' }; } }
  });
  const result = await adapter.lookupTrackedMessage({ messageId: 'missing' });
  assert.deepEqual(result, { kind: 'Unavailable' });
  assert.equal(Object.prototype.hasOwnProperty.call(result, 'messageId'), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, 'error'), false);
  console.log('Roadmap production lookup adapter Unavailable mapping passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
