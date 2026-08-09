const assert = require('node:assert/strict');
const { createEditSuccess, createSendSuccess, createFakeCommunityRoadmapMutationPort } = require('../../fakes/community/FakeCommunityRoadmapMutationPort');

(async () => {
  const payload = { embeds: [{ title: 'Roadmap' }] };
  const editRequest = Object.freeze({ messageId: 'message-m', payload });
  const sendRequest = Object.freeze({ payload });
  const port = createFakeCommunityRoadmapMutationPort({ sendMessageId: 'message-s' });
  const editResult = await port.edit(editRequest);
  const sendResult = await port.send(sendRequest);

  assert.deepEqual(editRequest, { messageId: 'message-m', payload });
  assert.deepEqual(sendRequest, { payload });
  assert.deepEqual(editResult, createEditSuccess('message-m'));
  assert.deepEqual(sendResult, createSendSuccess('message-s'));
  assert.equal(port.calls[0].request, editRequest);
  assert.equal(port.calls[1].request, sendRequest);
  for (const value of [editRequest, sendRequest, editResult, sendResult]) {
    for (const field of ['message', 'channel', 'guild', 'client', 'session', 'error', 'failure', 'saveOnboarding']) {
      assert.equal(field in value, false, field);
    }
  }
  console.log('Roadmap mutation Port test-only candidate contract passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
