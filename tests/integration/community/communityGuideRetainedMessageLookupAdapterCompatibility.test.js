const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');

(async () => {
  const message = { id: 'tracked', async edit() {} };
  let fetches = 0;
  const session = createGuidePublicationResourceSession({
    ensuredChannel: { id: 'guide', messages: { async fetch() { fetches += 1; return message; } }, async send() {} }
  });
  const result = await createGuidePublicationMessageLookupDiscordAdapter({ session }).lookup({ messageId: 'tracked' });
  assert.deepEqual(result, { status: 'MessageAvailable', messageId: 'tracked' });
  assert.strictEqual(session.getRetainedMessage(), message);
  assert.equal(fetches, 1);
  assert.equal(Object.hasOwn(result, 'message'), false);
  console.log('Guide retained-message lookup adapter compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
