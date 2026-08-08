const assert = require('node:assert/strict');
const { createGuidePublicationMessageMutationDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageMutationDiscordAdapter');

(async () => {
  assert.throws(() => createGuidePublicationMessageMutationDiscordAdapter(), /requires a session/);
  assert.throws(() => createGuidePublicationMessageMutationDiscordAdapter({ session: { async sendMessage() {} } }), /requires a session/);
  const calls = [];
  const adapter = createGuidePublicationMessageMutationDiscordAdapter({
    session: {
      async editTrackedMessage(payload) { calls.push({ method: 'edit', payload }); return { id: 'ignored' }; },
      async sendMessage(payload) { calls.push({ method: 'send', payload }); return { id: 'generated' }; }
    }
  });
  const editPayload = { embeds: [] }; const sendPayload = { content: 'guide' };
  const edit = await adapter.edit({ guildId: 'g', channelId: 'c', messageId: 'tracked', payload: editPayload });
  const send = await adapter.send({ guildId: 'g', channelId: 'c', payload: sendPayload });
  assert.deepEqual(edit, { kind: 'EditSuccess', messageId: 'tracked' });
  assert.deepEqual(send, { kind: 'SendSuccess', messageId: 'generated' });
  assert.equal('message' in edit, false); assert.equal('error' in send, false);
  assert.deepEqual(calls, [{ method: 'edit', payload: editPayload }, { method: 'send', payload: sendPayload }]);
  const missing = createGuidePublicationMessageMutationDiscordAdapter({ session: { async editTrackedMessage() {}, async sendMessage() { return {}; } } });
  assert.deepEqual(await missing.send({ payload: {} }), { kind: 'Failure', failureKind: 'MissingResource' });
  console.log('Guide production mutation Discord adapter passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
