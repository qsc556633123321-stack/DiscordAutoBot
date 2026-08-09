const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'M', async edit() { calls.edit += 1; return { id: 'E' }; } };
  const channel = {
    id: 'C',
    messages: { async fetch() { calls.fetch += 1; return message; } },
    async send() { calls.send += 1; return { id: 'S' }; }
  };
  const session = createRoadmapPublicationResourceSession({ ensuredChannel: channel });
  session.getRetainedMessage();
  session.getRetainedMutationFailure();
  assert.deepEqual(calls, { fetch: 0, edit: 0, send: 0 });
  await session.lookupTrackedMessage('M');
  await session.editTrackedMessage({});
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 0 });
  await session.sendMessage({});
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Roadmap Resource Session mutation adds no extra I/O');
})().catch((error) => { console.error(error); process.exitCode = 1; });
