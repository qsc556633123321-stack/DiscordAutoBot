const assert = require('node:assert/strict');

const { redirectRoadmapMutation } = require('../../fakes/community/FakeCommunityRoadmapRuntimeMutationRedirect');

(async () => {
  const writeFailure = new Error('legacy writer failure');
  const message = { id: 'M' };
  let edits = 0;
  await assert.rejects(
    redirectRoadmapMutation({
      pair: { mutationPort: { async edit() { edits += 1; } } },
      message,
      payload: {},
      write: async () => { throw writeFailure; }
    }),
    (actual) => actual === writeFailure
  );
  assert.equal(edits, 1);

  const sent = { id: 'S' };
  let sends = 0;
  await assert.rejects(
    redirectRoadmapMutation({
      pair: {
        mutationPort: {
          async send() {
            sends += 1;
            return { kind: 'SendSuccess', messageId: 'S' };
          }
        },
        getRetainedMessage() { return sent; }
      },
      message: null,
      payload: {},
      write: async () => { throw writeFailure; }
    }),
    (actual) => actual === writeFailure
  );
  assert.equal(sends, 1);

  console.log('Roadmap redirect candidate leaves legacy writer swallowing outside the redirect boundary');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
