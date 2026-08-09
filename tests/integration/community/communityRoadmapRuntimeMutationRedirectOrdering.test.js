const assert = require('node:assert/strict');

const { redirectRoadmapMutation } = require('../../fakes/community/FakeCommunityRoadmapRuntimeMutationRedirect');

(async () => {
  const editCalls = [];
  const message = { id: 'M' };
  const edited = await redirectRoadmapMutation({
    pair: {
      mutationPort: {
        async edit(request) {
          editCalls.push('edit');
          assert.strictEqual(request.messageId, 'M');
        }
      }
    },
    message,
    payload: { kind: 'edit' },
    write: async (value) => {
      editCalls.push('write');
      assert.strictEqual(value, message);
    }
  });
  assert.strictEqual(edited, message);
  assert.deepEqual(editCalls, ['edit', 'write']);

  const sendCalls = [];
  const sent = { id: 'S' };
  const sentResult = await redirectRoadmapMutation({
    pair: {
      mutationPort: {
        async send() {
          sendCalls.push('send');
          return { kind: 'SendSuccess', messageId: 'S' };
        }
      },
      getRetainedMessage() {
        sendCalls.push('getter');
        return sent;
      }
    },
    message: null,
    payload: { kind: 'send' },
    write: async (value) => {
      sendCalls.push('write');
      assert.strictEqual(value, sent);
    }
  });
  assert.strictEqual(sentResult, sent);
  assert.deepEqual(sendCalls, ['send', 'getter', 'write']);

  console.log('Roadmap redirect candidate preserves mutation-before-persistence ordering');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
