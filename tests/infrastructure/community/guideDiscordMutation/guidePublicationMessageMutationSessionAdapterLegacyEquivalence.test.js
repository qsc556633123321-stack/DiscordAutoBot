const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  const calls = { edit: [], send: [] };
  const message = { id: 'tracked', async edit(payload) { calls.edit.push(payload); return { id: 'different-return-id' }; } };
  const channel = {
    id: 'guide',
    messages: { async fetch() { return message; } },
    async send(payload) { calls.send.push(payload); return { id: 'generated' }; }
  };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  await session.lookupTrackedMessage('tracked');
  const candidate = createFakeGuidePublicationMessageMutationSessionAdapter({ session });
  const payload = { embeds: [] };
  assert.deepEqual(await candidate.edit({ guildId: 'g', channelId: 'guide', messageId: 'tracked', payload }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await candidate.send({ guildId: 'g', channelId: 'guide', payload }), { kind: 'SendSuccess', messageId: 'generated' });
  assert.deepEqual(calls, { edit: [payload], send: [payload] });
  console.log('Guide mutation adapter session legacy equivalence preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
