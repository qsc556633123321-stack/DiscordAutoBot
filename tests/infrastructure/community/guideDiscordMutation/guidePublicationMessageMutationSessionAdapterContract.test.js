const assert = require('node:assert/strict');
const { createFakeGuidePublicationMessageMutationSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageMutationSessionAdapter');

(async () => {
  assert.throws(() => createFakeGuidePublicationMessageMutationSessionAdapter(), /requires a session/);
  const calls = [];
  const adapter = createFakeGuidePublicationMessageMutationSessionAdapter({
    session: {
      async editTrackedMessage(payload) { calls.push({ method: 'edit', payload }); return { id: 'edited-return' }; },
      async sendMessage(payload) { calls.push({ method: 'send', payload }); return { id: 'sent' }; }
    }
  });
  const editPayload = { embeds: [] };
  const sendPayload = { content: 'guide' };
  assert.deepEqual(await adapter.edit({ guildId: 'g', channelId: 'c', messageId: 'tracked', payload: editPayload }), { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(await adapter.send({ guildId: 'g', channelId: 'c', payload: sendPayload }), { kind: 'SendSuccess', messageId: 'sent' });
  assert.deepEqual(calls, [{ method: 'edit', payload: editPayload }, { method: 'send', payload: sendPayload }]);
  console.log('Guide mutation adapter session contract preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
