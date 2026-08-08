const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  const sent = [];
  const channel = { id: 'guide', messages: { async fetch() {} }, async send(payload) { sent.push(payload); return { id: 'generated' }; } };
  const payload = { content: 'guide' };
  const adapter = createGuidePublicationMessageMutationDiscordAdapter({ session: createGuidePublicationResourceSession({ ensuredChannel: channel }) });
  assert.deepEqual(await adapter.send({ guildId: 'g', channelId: 'guide', payload }), { kind: 'SendSuccess', messageId: 'generated' });
  assert.deepEqual(sent, [payload]);
  console.log('Guide production mutation adapter send equivalence passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
