const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimeLookupRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimeLookupRedirect');
const { GuidePublicationMessageLookupStatus } = require('../../../src/application/community/guideLookup/GuidePublicationMessageLookupStatus');

(async () => {
  const payload = { embeds: ['guide'] };
  const message = { id: 'tracked', edits: [], async edit(value) { this.edits.push(value); return this; } };
  const sent = { id: 'sent' };
  const calls = [];
  const redirect = createFakeCommunityGuideRuntimeLookupRedirect({
    lookupPort: { async lookup(request) { calls.push(['lookup', request]); return { status: GuidePublicationMessageLookupStatus.MessageAvailable, messageId: request.messageId }; } },
    getRetainedMessage() { return message; },
    buildPlan({ existingMessageAvailable }) { return { operation: existingMessageAvailable ? 'EditExistingMessage' : 'SendNewMessage' }; },
    legacyMutation: {
      async edit(target, value) { calls.push(['edit', target, value]); return target.edit(value); },
      async send(value) { calls.push(['send', value]); return sent; }
    }
  });
  const result = await redirect.publish({ mode: 'refresh', messageId: 'tracked', payload });
  assert.strictEqual(result.message, message);
  assert.deepEqual(calls.map(([kind]) => kind), ['lookup', 'edit']);
  assert.strictEqual(calls[1][1], message);
  assert.strictEqual(calls[1][2], payload);
  console.log('Community guide runtime lookup redirect equivalence candidate passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
