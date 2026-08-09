const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createFakeProductionShapeRoadmapLookupAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapLookupAdapter');

(async () => {
  const message = { id: 'tracked-message' };
  let fetches = 0;
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'roadmap-channel', messages: { fetch: async () => { fetches += 1; return message; } } }
  });
  const adapter = createFakeProductionShapeRoadmapLookupAdapter({ resourceSession: session });
  assert.deepEqual(await adapter.lookupTrackedMessage({ messageId: 'tracked-message' }), { kind: 'Available', messageId: 'tracked-message' });
  assert.equal(session.getRetainedMessage(), message);
  assert.equal(fetches, 1);

  let falsyFetches = 0;
  const falsySession = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'roadmap-channel', messages: { fetch: async () => { falsyFetches += 1; return message; } } }
  });
  const falsyAdapter = createFakeProductionShapeRoadmapLookupAdapter({ resourceSession: falsySession });
  assert.deepEqual(await falsyAdapter.lookupTrackedMessage({ messageId: false }), { kind: 'Unavailable' });
  assert.equal(falsyFetches, 0);
  console.log('Roadmap lookup adapter preparation equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
