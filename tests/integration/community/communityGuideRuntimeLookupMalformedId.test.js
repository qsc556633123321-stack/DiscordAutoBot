const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirect');

(async () => {
  let received = null;
  const redirect = createFakeCommunityGuideRuntimeLookupRedirect({
    lookupPort: { async lookup(request) { received = request.messageId; return { status: 'MessageUnavailable', messageId: request.messageId }; } },
    getRetainedMessage() { return null; },
    buildPlan() { return { operation: 'SendNewMessage' }; },
    legacyMutation: { async edit() {}, async send() { return { id: 'new' }; } }
  });
  const result = await redirect.publish({ mode: 'normal', messageId: 'not a Discord id', payload: {} });
  assert.equal(received, 'not a Discord id');
  assert.equal(result.plan.operation, 'SendNewMessage');
  console.log('Community guide runtime lookup malformed-id candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
