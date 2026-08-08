const assert = require('node:assert/strict');
const { createFakeGuideLookupMessageIdentityHandoff } = require('../../fakes/community/FakeGuideLookupMessageIdentityHandoff');

(async () => {
  const message = { id: 'message', async edit() {} };
  let fetches = 0;
  const handoff = createFakeGuideLookupMessageIdentityHandoff({ async fetchMessage() { fetches += 1; return message; } });
  const result = await handoff.lookup('message');
  assert.deepEqual(result, { status: 'MessageAvailable', messageId: 'message' });
  assert.strictEqual(handoff.handoffRetainedMessage(), message);
  await handoff.handoffRetainedMessage().edit({});
  assert.equal(fetches, 1);
  console.log('Community guide lookup message identity continuity passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
