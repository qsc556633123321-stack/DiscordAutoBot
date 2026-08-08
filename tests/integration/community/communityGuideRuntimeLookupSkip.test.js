const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirect');

(async () => {
  for (const input of [{ mode: 'force', messageId: 'tracked' }, { mode: 'normal', messageId: null }, { mode: 'normal', messageId: '' }]) {
    let lookups = 0;
    const redirect = createFakeCommunityGuideRuntimeLookupRedirect({
      lookupPort: { async lookup() { lookups += 1; } },
      getRetainedMessage() { return null; },
      buildPlan() { return { operation: 'SendNewMessage' }; },
      legacyMutation: { async edit() {}, async send() { return { id: 'new' }; } }
    });
    await redirect.publish({ ...input, payload: {} });
    assert.equal(lookups, 0, JSON.stringify(input));
  }
  console.log('Community guide runtime lookup skip candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
