const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationResourceSession } = require('../../fakes/community/FakeCommunityRoadmapMutationResourceSession');

(async () => {
  for (const rejection of [new Error('edit'), 'edit', 1, { edit: true }, null, undefined]) {
    const message = { id: 'M', async edit() { throw rejection; } };
    const channel = { id: 'C', messages: { async fetch() { return message; } }, async send() { return { id: 'S' }; } };
    const session = createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel: channel });
    await session.lookupTrackedMessage('M');
    await assert.rejects(() => session.editTrackedMessage({}), (actual) => actual === rejection);
    assert.equal(session.getRetainedMessage(), message);
    assert.equal(session.getRetainedMutationFailure().hasFailure, true);
    assert.equal(session.getRetainedMutationFailure().failure, rejection);
  }
  for (const rejection of [new Error('send'), 'send', 2, { send: true }, null, undefined]) {
    const prior = { id: 'M', async edit() {} };
    const channel = { id: 'C', messages: { async fetch() { return prior; } }, async send() { throw rejection; } };
    const session = createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel: channel });
    await session.lookupTrackedMessage('M');
    await assert.rejects(() => session.sendMessage({}), (actual) => actual === rejection);
    assert.equal(session.getRetainedMessage(), prior);
    assert.equal(session.getRetainedMutationFailure().hasFailure, true);
    assert.equal(session.getRetainedMutationFailure().failure, rejection);
  }
  console.log('Roadmap mutation Resource Session candidate preserves exact failure identity and undefined presence');
})().catch((error) => { console.error(error); process.exitCode = 1; });
