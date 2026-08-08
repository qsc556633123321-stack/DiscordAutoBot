const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirect');
const cases = require('../../fixtures/community/community-guide-runtime-lookup-redirect-cases.json');

(async () => {
  assert.equal(cases.length, 80);
  for (const item of cases) {
    const calls = [];
    const retainedMessage = item.status === 'MessageAvailable' ? { id: item.messageId } : null;
    const redirect = createFakeCommunityGuideRuntimeLookupRedirect({
      lookupPort: { async lookup(request) { calls.push(['lookup', request.messageId]); return { status: item.status, messageId: request.messageId }; } },
      getRetainedMessage() { return retainedMessage; },
      buildPlan({ existingMessageAvailable }) { return { operation: existingMessageAvailable ? 'EditExistingMessage' : 'SendNewMessage' }; },
      legacyMutation: { async edit() { calls.push(['edit']); }, async send() { calls.push(['send']); return { id: 'new' }; } }
    });
    const result = await redirect.publish({ mode: item.mode, messageId: item.messageId, payload: {} });
    const shouldLookup = Boolean(item.messageId) && item.mode !== 'force';
    assert.equal(calls.filter(([kind]) => kind === 'lookup').length, shouldLookup ? 1 : 0, item.id);
    assert.equal(result.plan.operation, item.status === 'MessageAvailable' && shouldLookup ? 'EditExistingMessage' : 'SendNewMessage', item.id);
  }
  console.log('Community guide runtime lookup failure mapping candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
