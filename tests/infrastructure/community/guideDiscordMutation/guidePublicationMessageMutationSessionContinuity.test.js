const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  const counts = { fetch: 0, edit: 0, send: 0 };
  const message = { id: 'tracked', async edit() { counts.edit += 1; return this; } };
  const channel = { id: 'guide', messages: { async fetch() { counts.fetch += 1; return message; } }, async send() { counts.send += 1; return { id: 'sent' }; } };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  const lookup = createGuidePublicationMessageLookupDiscordAdapter({ session });
  const mutation = createFakeGuidePublicationMessageMutationSessionAdapter({ session });
  await lookup.lookup({ messageId: 'tracked' });
  await mutation.edit({ guildId: 'g', channelId: 'guide', messageId: 'tracked', payload: {} });
  await mutation.send({ guildId: 'g', channelId: 'guide', payload: {} });
  assert.deepEqual(counts, { fetch: 1, edit: 1, send: 1 });
  console.log('Guide mutation adapter session continuity preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
