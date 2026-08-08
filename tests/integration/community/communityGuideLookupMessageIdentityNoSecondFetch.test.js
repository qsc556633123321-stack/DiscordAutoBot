const assert = require('node:assert/strict');
const { createFakeGuideLookupMessageIdentityHandoff } = require('../../fakes/community/FakeGuideLookupMessageIdentityHandoff');

(async () => {
  const message = { id: 'm' };
  let fetches = 0;
  const handoff = createFakeGuideLookupMessageIdentityHandoff({ async fetchMessage() { fetches += 1; return message; } });
  await handoff.lookup('m');
  const editReceiver = handoff.handoffRetainedMessage();
  assert.strictEqual(editReceiver, message);
  assert.equal(fetches, 1);
  console.log('Community guide lookup message identity no-second-fetch passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
