const assert = require('node:assert/strict');
const { runLookupRedirectCandidate } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirectWithPairHandoff');
(async () => {
  const pair = { lookupPort: { async lookup() { return { status: 'MessageUnavailable', messageId: 'bad' }; } }, getRetainedMessage() { return null; } };
  assert.deepEqual(await runLookupRedirectCandidate({ pair, guideMessageId: 'bad' }), { message: null, lookupCalls: 1, branch: 'send' });
  console.log('Guide runtime lookup redirect refresh failure mapping passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
