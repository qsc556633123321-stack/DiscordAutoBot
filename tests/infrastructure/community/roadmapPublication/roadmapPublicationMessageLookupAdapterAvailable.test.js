const assert = require('node:assert/strict');
const { createRoadmapPublicationMessageLookupAdapter } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageLookupAdapter');

(async () => {
  assert.throws(() => createRoadmapPublicationMessageLookupAdapter(), /RoadmapPublicationMessageLookupAdapter requires resourceSession\.lookupTrackedMessage/);
  const messageId = { exact: true };
  let calls = 0;
  const adapter = createRoadmapPublicationMessageLookupAdapter({
    resourceSession: { async lookupTrackedMessage(value) { calls += 1; return { kind: 'Available', messageId: value }; } }
  });
  assert.deepEqual(Object.keys(adapter), ['lookupTrackedMessage']);
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId }), { kind: 'Available', messageId });
  assert.equal(calls, 1);
  console.log('Roadmap production lookup adapter Available mapping passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
