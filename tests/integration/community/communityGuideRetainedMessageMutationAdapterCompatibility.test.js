const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  const calls = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { calls.edit += 1; return this; } };
  const session = createGuidePublicationResourceSession({
    ensuredChannel: { id: 'guide', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() { calls.send += 1; return { id: 'sent' }; } }
  });
  await session.lookupTrackedMessage('tracked');
  assert.strictEqual(session.getRetainedMessage(), message);
  const adapter = createGuidePublicationMessageMutationDiscordAdapter({ session });
  assert.deepEqual(await adapter.edit({ messageId: 'tracked', payload: {} }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await adapter.send({ payload: {} }), { kind: 'SendSuccess', messageId: 'sent' });
  assert.deepEqual(calls, { fetch: 1, edit: 1, send: 1 });
  console.log('Guide retained-message mutation adapter compatibility passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
