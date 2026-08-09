const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationPort } = require('../../fakes/community/FakeCommunityRoadmapMutationPort');

(async () => {
  const payload = { embeds: [{ title: 'Roadmap' }] };
  const retainedMessage = { id: 'M' };
  const sentMessage = { id: 'S' };
  const port = createFakeCommunityRoadmapMutationPort({ editMessageId: retainedMessage.id, sendMessageId: sentMessage.id });
  const edit = await port.edit({ messageId: retainedMessage.id, payload });
  assert.deepEqual(edit, { kind: 'EditSuccess', messageId: retainedMessage.id });
  assert.equal(retainedMessage.id, edit.messageId);
  const send = await port.send({ payload });
  assert.deepEqual(send, { kind: 'SendSuccess', messageId: sentMessage.id });
  assert.equal(sentMessage.id, send.messageId);
  assert.equal(port.calls[0].request.payload, payload);
  assert.equal(port.calls[1].request.payload, payload);
  console.log('Roadmap mutation Port test-only candidate preserves legacy identity handoff shape');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
