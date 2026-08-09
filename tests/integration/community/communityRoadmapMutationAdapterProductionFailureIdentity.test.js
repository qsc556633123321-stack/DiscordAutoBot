const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageMutationAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter');

(async () => {
  for (const operation of ['edit', 'send']) {
    for (const rejection of [new Error(operation), operation, 7, { operation }, null, undefined]) {
      let failureGetterCalls = 0;
      const message = { id: 'M', async edit() { throw rejection; } };
      const session = createRoadmapPublicationResourceSession({
        ensuredChannel: { id: 'C', messages: { async fetch() { return message; } }, async send() { throw rejection; } }
      });
      const failureGetter = session.getRetainedMutationFailure;
      session.getRetainedMutationFailure = () => { failureGetterCalls += 1; return failureGetter(); };
      const adapter = createRoadmapPublicationMessageMutationAdapter({ resourceSession: session });
      if (operation === 'edit') await session.lookupTrackedMessage('M');
      const invoke = operation === 'edit'
        ? () => adapter.edit({ messageId: 'M', payload: {} })
        : () => adapter.send({ payload: {} });
      await assert.rejects(invoke, (actual) => actual === rejection);
      assert.equal(failureGetterCalls, 0);
      assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
    }
  }
  console.log('Roadmap production mutation adapter preserves exact Session failures');
})().catch((error) => { console.error(error); process.exitCode = 1; });
