const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  const values = [undefined, null, '', 0, false, ' malformed ', 12, { id: 'object' }];
  for (const messageId of values) {
    let received;
    const adapter = createRoadmapPublicationMessageLookupAdapter({
      resourceSession: { async lookupTrackedMessage(value) { received = value; return { kind: 'Unavailable' }; } }
    });
    assert.deepEqual(await adapter.lookupTrackedMessage({ messageId }), { kind: 'Unavailable' });
    assert.equal(received, messageId);
  }
  console.log('Roadmap production lookup adapter preserves request values');
})().catch((error) => { console.error(error); process.exitCode = 1; });
