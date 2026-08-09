const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createFakeProductionShapeRoadmapMutationAdapter } = require('../../fakes/community/FakeProductionShapeRoadmapMutationAdapter');

(async () => {
  const rejection = { reason: 'edit failed' };
  let getterCalls = 0;
  const message = { id: 'M', async edit() { throw rejection; } };
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: { id: 'C', messages: { async fetch() { return message; } }, async send() { return { id: 'S' }; } }
  });
  const originalGetter = session.getRetainedMutationFailure;
  session.getRetainedMutationFailure = () => {
    getterCalls += 1;
    return originalGetter();
  };
  const adapter = createFakeProductionShapeRoadmapMutationAdapter({ resourceSession: session });
  await session.lookupTrackedMessage('M');
  await assert.rejects(() => adapter.edit({ messageId: 'M', payload: {} }), (failure) => failure === rejection);
  assert.equal(getterCalls, 0);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
  console.log('Roadmap mutation adapter candidate leaves failure getter session-owned');
})().catch((error) => { console.error(error); process.exitCode = 1; });
