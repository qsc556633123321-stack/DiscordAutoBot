const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationResourceSession } = require('../../fakes/community/FakeCommunityRoadmapMutationResourceSession');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const editResult = { id: 'E' };
  const message = { id: 'M', async edit(payload) { calls.edit += 1; assert.equal(payload, input.payload); return editResult; } };
  const sent = { id: 'S' };
  const channel = { id: 'C', messages: { async fetch() { calls.fetch += 1; return message; } }, async send(payload) { calls.send += 1; assert.equal(payload, input.payload); return sent; } };
  const input = { payload: { embeds: [{ title: 'Roadmap' }] } };
  const session = createFakeCommunityRoadmapMutationResourceSession({ ensuredChannel: channel });
  await session.lookupTrackedMessage('M');
  assert.equal(await session.editTrackedMessage(input.payload), editResult);
  assert.equal(session.getRetainedMessage(), message);
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 0 });
  assert.equal(await session.sendMessage(input.payload), sent);
  assert.equal(session.getRetainedMessage(), sent);
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Roadmap mutation Resource Session candidate preserves Edit M and Send S identity');
})().catch((error) => { console.error(error); process.exitCode = 1; });
