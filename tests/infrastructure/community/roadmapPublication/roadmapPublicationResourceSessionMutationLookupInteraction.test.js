const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  const rejection = { reason: 'edit failed' };
  const message = { id: 'M', async edit() { throw rejection; } };
  const channel = { id: 'C', messages: { async fetch(id) { return id === 'M' ? message : null; } }, async send() { return { id: 'S' }; } };
  const session = createRoadmapPublicationResourceSession({ ensuredChannel: channel });
  await session.lookupTrackedMessage('M');
  await assert.rejects(() => session.editTrackedMessage({}), (failure) => failure === rejection);
  await session.lookupTrackedMessage('M');
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
  await session.lookupTrackedMessage('missing');
  assert.equal(session.getRetainedMessage(), null);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
  console.log('Roadmap Resource Session lookup preserves mutation failure state');
})().catch((error) => { console.error(error); process.exitCode = 1; });
