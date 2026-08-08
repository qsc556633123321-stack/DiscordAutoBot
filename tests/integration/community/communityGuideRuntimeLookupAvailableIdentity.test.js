const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirect');

(async () => {
  const exactMessage = { id: 'exact-message' };
  let edited = null;
  const redirect = createFakeCommunityGuideRuntimeLookupRedirect({
    lookupPort: { async lookup() { return { status: 'MessageAvailable', messageId: 'exact-message' }; } },
    getRetainedMessage() { return exactMessage; },
    buildPlan() { return { operation: 'EditExistingMessage' }; },
    legacyMutation: { async edit(message) { edited = message; return message; }, async send() { throw new Error('unexpected send'); } }
  });
  const result = await redirect.publish({ mode: 'normal', messageId: 'exact-message', payload: {} });
  assert.strictEqual(result.message, exactMessage);
  assert.strictEqual(edited, exactMessage);
  console.log('Community guide runtime lookup available identity candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
