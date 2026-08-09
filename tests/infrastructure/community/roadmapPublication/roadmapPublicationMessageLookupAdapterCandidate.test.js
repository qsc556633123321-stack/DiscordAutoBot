const assert = require('node:assert/strict');
const { createFakeProductionShapeRoadmapLookupAdapter } = require('../../../fakes/community/FakeProductionShapeRoadmapLookupAdapter');

(async () => {
  assert.throws(() => createFakeProductionShapeRoadmapLookupAdapter(), /resourceSession\.lookupTrackedMessage/);
  let calls = 0;
  const adapter = createFakeProductionShapeRoadmapLookupAdapter({
    resourceSession: {
      async lookupTrackedMessage(messageId) {
        calls += 1;
        return { kind: 'Available', messageId };
      }
    }
  });
  assert.equal(typeof adapter.lookupTrackedMessage, 'function');
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: 0 }), { kind: 'Available', messageId: 0 });
  assert.equal(calls, 1);
  const unavailable = createFakeProductionShapeRoadmapLookupAdapter({
    resourceSession: { async lookupTrackedMessage() { return { kind: 'Unavailable' }; } }
  });
  assert.deepEqual(await unavailable.lookupTrackedMessage({ messageId: 'missing' }), { kind: 'Unavailable' });
  assert.equal(Object.prototype.hasOwnProperty.call(await unavailable.lookupTrackedMessage({ messageId: 'missing' }), 'error'), false);
  console.log('Roadmap lookup adapter candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
