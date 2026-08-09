const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  for (const rejection of [new Error('edit'), 'edit', 1, { edit: true }, null, undefined]) {
    const message = { id: 'M', async edit() { throw rejection; } };
    const session = createRoadmapPublicationResourceSession({
      ensuredChannel: { id: 'C', messages: { async fetch() { return message; } }, async send() { return { id: 'S' }; } }
    });
    await session.lookupTrackedMessage('M');
    await assert.rejects(() => session.editTrackedMessage({}), (failure) => failure === rejection);
    assert.equal(session.getRetainedMessage(), message);
    assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
  }

  for (const rejection of [new Error('send'), 'send', 2, { send: true }, null, undefined]) {
    const message = { id: 'M', async edit() { return { id: 'E' }; } };
    const session = createRoadmapPublicationResourceSession({
      ensuredChannel: { id: 'C', messages: { async fetch() { return message; } }, async send() { throw rejection; } }
    });
    await session.lookupTrackedMessage('M');
    await assert.rejects(() => session.sendMessage({}), (failure) => failure === rejection);
    assert.equal(session.getRetainedMessage(), message);
    assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: rejection });
  }
  console.log('Roadmap Resource Session preserves exact mutation failure identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
