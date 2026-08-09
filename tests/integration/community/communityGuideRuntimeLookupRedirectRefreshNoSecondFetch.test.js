const assert = require('node:assert/strict');
const { runLookupRedirectCandidate } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirectWithPairHandoff');
(async () => {
  const message = { id: 'm' }; let fetches = 0;
  const pair = { lookupPort: { async lookup() { fetches += 1; return { status: 'MessageAvailable', messageId: 'm' }; } }, getRetainedMessage() { return message; } };
  const result = await runLookupRedirectCandidate({ pair, guideMessageId: 'm' });
  assert.strictEqual(result.message, message); assert.equal(fetches, 1); assert.strictEqual(pair.getRetainedMessage(), message); assert.equal(fetches, 1);
  console.log('Guide runtime lookup redirect refresh no second fetch passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
