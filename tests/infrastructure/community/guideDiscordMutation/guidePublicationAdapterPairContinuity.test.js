const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  const counts = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { counts.edit += 1; return this; } };
  const channel = { id: 'guide', messages: { async fetch() { counts.fetch += 1; return message; } }, async send() { counts.send += 1; return { id: 'sent' }; } };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  const lookup = createGuidePublicationMessageLookupDiscordAdapter({ session });
  const mutation = createGuidePublicationMessageMutationDiscordAdapter({ session });
  await lookup.lookup({ messageId: 'tracked' });
  await mutation.edit({ messageId: 'tracked', payload: {} });
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 0 });
  const forceSession = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await createGuidePublicationMessageMutationDiscordAdapter({ session: forceSession }).send({ payload: {} });
  assert.equal(counts.fetch, 1); assert.equal(counts.send, 1);
  console.log('Guide production adapter pair continuity passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
