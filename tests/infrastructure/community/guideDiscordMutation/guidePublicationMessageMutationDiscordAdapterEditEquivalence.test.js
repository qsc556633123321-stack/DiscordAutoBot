const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  const calls = { fetch: 0, edit: [] };
  const message = { id: 'tracked', async edit(payload) { calls.edit.push(payload); return { id: 'ignored' }; } };
  const channel = { id: 'guide', messages: { async fetch() { calls.fetch += 1; return message; } }, async send() {} };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await createGuidePublicationMessageLookupDiscordAdapter({ session }).lookup({ messageId: 'tracked' });
  const payload = { embeds: [] };
  const result = await createGuidePublicationMessageMutationDiscordAdapter({ session }).edit({ guildId: 'g', channelId: 'guide', messageId: 'tracked', payload });
  assert.deepEqual(result, { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(calls, { fetch: 1, edit: [payload] });
  console.log('Guide production mutation adapter edit equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
