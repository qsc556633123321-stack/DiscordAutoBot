const assert = require('node:assert/strict');
const { runLookupRedirectCandidate } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirectWithPairHandoff');
(async () => {
  const message = { id: 'm' }; let calls = 0;
  const pair = { lookupPort: { async lookup() { calls += 1; return { status: 'MessageAvailable', messageId: 'm' }; } }, getRetainedMessage() { return message; } };
  assert.deepEqual(await runLookupRedirectCandidate({ pair, force: true, guideMessageId: 'm' }), { message: null, lookupCalls: 0, branch: 'send' });
  assert.deepEqual(await runLookupRedirectCandidate({ pair }), { message: null, lookupCalls: 0, branch: 'send' });
  const actual = await runLookupRedirectCandidate({ pair, guideMessageId: 'm' });
  assert.strictEqual(actual.message, message); assert.equal(actual.branch, 'edit'); assert.equal(calls, 1);
  console.log('Guide runtime lookup redirect refresh equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
