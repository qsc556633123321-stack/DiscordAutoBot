const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');
const { createRoadmapPublicationMessageMutationAdapter } = require('../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationMessageMutationAdapter');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0, failureGetter: 0 };
  const message = { id: 'M', async edit() { calls.edit += 1; return { id: 'E' }; } };
  const session = createRoadmapPublicationResourceSession({
    ensuredChannel: {
      id: 'C',
      messages: { async fetch() { calls.fetch += 1; return message; } },
      async send() { calls.send += 1; return { id: 'S' }; }
    }
  });
  const getter = session.getRetainedMutationFailure;
  session.getRetainedMutationFailure = () => { calls.failureGetter += 1; return getter(); };
  const adapter = createRoadmapPublicationMessageMutationAdapter({ resourceSession: session });
  await session.lookupTrackedMessage('M');
  await adapter.edit({ messageId: 'M', payload: {} });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 0, failureGetter: 0 });
  await adapter.send({ payload: {} });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1, failureGetter: 0 });
  console.log('Roadmap production mutation adapter adds no extra I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
