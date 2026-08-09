const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  const message = { id: 'M', async edit() { throw undefined; } };
  const channel = { id: 'C', messages: { async fetch() { return message; } }, async send() { throw undefined; } };
  const session = createRoadmapPublicationResourceSession({ ensuredChannel: channel });
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  await session.lookupTrackedMessage('M');
  await assert.rejects(() => session.editTrackedMessage({}), (failure) => failure === undefined);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: undefined });
  await assert.rejects(() => session.sendMessage({}), (failure) => failure === undefined);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: undefined });
  console.log('Roadmap Resource Session undefined failure presence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
