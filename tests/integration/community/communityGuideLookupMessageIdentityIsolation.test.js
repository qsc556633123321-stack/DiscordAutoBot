const assert = require('node:assert/strict');
const { createFakeGuideLookupMessageIdentityHandoff } = require('../../fakes/community/FakeGuideLookupMessageIdentityHandoff');

(async () => {
  const first = { id: 'first' };
  const second = { id: 'second' };
  const a = createFakeGuideLookupMessageIdentityHandoff({ async fetchMessage() { return first; } });
  const b = createFakeGuideLookupMessageIdentityHandoff({ async fetchMessage() { return second; } });
  await Promise.all([a.lookup('same-id'), b.lookup('same-id')]);
  assert.strictEqual(a.handoffRetainedMessage(), first);
  assert.strictEqual(b.handoffRetainedMessage(), second);
  console.log('Community guide lookup message identity isolation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
