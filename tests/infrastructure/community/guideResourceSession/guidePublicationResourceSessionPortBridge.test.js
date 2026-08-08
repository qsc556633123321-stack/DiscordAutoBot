const assert = require('node:assert/strict');
const { createFakeGuidePublicationResourceSession } = require('../../../fakes/community/FakeGuidePublicationResourceSession');

(async () => {
  const channel = { id: 'guide-channel', async send(payload) { return { id: 'sent', payload }; } };
  const message = { id: 'guide-message', async edit(payload) { return { id: this.id, payload }; } };
  const session = createFakeGuidePublicationResourceSession({ channel, message });
  const lookupAdapterCandidate = {
    async lookup(request) {
      const found = await session.lookupTrackedMessage(request.messageId);
      return found ? { status: 'MessageAvailable', messageId: request.messageId } : { status: 'MessageUnavailable', messageId: request.messageId };
    }
  };
  const mutationAdapterCandidate = {
    async execute(request) {
      return request.kind === 'Edit'
        ? session.editTrackedMessage(request.payload)
        : session.sendMessage(request.payload);
    }
  };
  const result = await lookupAdapterCandidate.lookup({ guildId: 'g', channelId: 'c', messageId: 'guide-message' });
  assert.deepEqual(result, { status: 'MessageAvailable', messageId: 'guide-message' });
  assert.equal('channel' in result, false);
  assert.equal('message' in result, false);
  await mutationAdapterCandidate.execute({ kind: 'Edit', payload: { embeds: [] } });
  assert.strictEqual(session.calls[0].channel, channel);
  assert.strictEqual(session.calls[1].message, message);
  console.log('Guide publication resource session port bridge passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
