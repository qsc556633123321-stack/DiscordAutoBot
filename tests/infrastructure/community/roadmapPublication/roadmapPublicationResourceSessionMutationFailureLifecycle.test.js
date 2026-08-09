const assert = require('node:assert/strict');
const { createRoadmapPublicationResourceSession } = require('../../../../src/infrastructure/community/roadmapPublication/RoadmapPublicationResourceSession');

(async () => {
  const firstFailure = { id: 'E1' };
  const secondFailure = { id: 'E2' };
  let editFailure = firstFailure;
  let sendFailure = null;
  const message = { id: 'M', async edit() { if (editFailure !== null) throw editFailure; return { id: 'edit-result' }; } };
  const channel = {
    id: 'C',
    messages: { async fetch() { return message; } },
    async send() { if (sendFailure !== null) throw sendFailure; return { id: 'S' }; }
  };
  const session = createRoadmapPublicationResourceSession({ ensuredChannel: channel });
  await session.lookupTrackedMessage('M');
  await assert.rejects(() => session.editTrackedMessage({}), (failure) => failure === firstFailure);
  editFailure = null;
  await session.editTrackedMessage({});
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  sendFailure = firstFailure;
  await assert.rejects(() => session.sendMessage({}), (failure) => failure === firstFailure);
  sendFailure = null;
  await session.sendMessage({});
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  sendFailure = firstFailure;
  await assert.rejects(() => session.sendMessage({}), (failure) => failure === firstFailure);
  await session.lookupTrackedMessage('M');
  editFailure = secondFailure;
  await assert.rejects(() => session.editTrackedMessage({}), (failure) => failure === secondFailure);
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: true, failure: secondFailure });
  console.log('Roadmap Resource Session stale failure lifecycle passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
