const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationResourceSession } = require('../../fakes/community/FakeCommunityRoadmapMutationResourceSession');

(async () => {
  let editFailure = 'E1';
  const first = { id: 'M', async edit() { if (editFailure !== null) throw editFailure; return { id: 'ignored-edit-result' }; } };
  const second = { id: 'S1' };
  const third = { id: 'S2' };
  const sent = [second, third];
  const channel = { id: 'C', messages: { async fetch() { return first; } }, async send() { return sent.shift(); } };
  const session = createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel: channel });
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  await session.lookupTrackedMessage('M');
  await assert.rejects(() => session.editTrackedMessage({}), (error) => error === 'E1');
  assert.equal(session.getRetainedMutationFailure().failure, 'E1');
  editFailure = null;
  await session.editTrackedMessage({});
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  assert.equal(session.getRetainedMessage(), first);
  await session.sendMessage({});
  assert.equal(session.getRetainedMessage(), second);
  await session.sendMessage({});
  assert.equal(session.getRetainedMessage(), third);
  await session.lookupTrackedMessage('M');
  assert.deepEqual(session.getRetainedMutationFailure(), { hasFailure: false });
  console.log('Roadmap mutation Resource Session candidate lifecycle and stale-failure clearing passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
