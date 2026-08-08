const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');

function createChannel({ message = null, fetchError } = {}) {
  const calls = { fetch: [], edit: [], send: [], resolve: 0 };
  const channel = {
    id: 'guide-channel',
    messages: {
      async fetch(messageId) {
        calls.fetch.push(messageId);
        if (fetchError) throw fetchError;
        return message;
      }
    },
    async send(payload) { calls.send.push(payload); return { id: 'sent' }; }
  };
  return { channel, calls };
}

(async () => {
  const message = { async edit(payload) { edits.push(payload); return { id: 'edited' }; } };
  const edits = [];
  const { channel, calls } = createChannel({ message });
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  assert.equal(session.getChannelId(), 'guide-channel');
  assert.deepEqual(calls, { fetch: [], edit: [], send: [], resolve: 0 });
  const opaque = { legacy: true };
  assert.deepEqual(await session.lookupTrackedMessage(opaque), { available: true });
  assert.strictEqual(calls.fetch[0], opaque);
  await session.editTrackedMessage({ embeds: [] });
  assert.deepEqual(edits, [{ embeds: [] }]);
  assert.equal(calls.fetch.length, 1);
  await session.sendMessage({ content: 'guide' });
  assert.deepEqual(calls.send, [{ content: 'guide' }]);
  for (const value of [42, ['id'], true, '  id  ']) {
    const current = createChannel({ message });
    const currentSession = createGuidePublicationResourceSession({ ensuredChannel: current.channel });
    await currentSession.lookupTrackedMessage(value);
    assert.strictEqual(current.calls.fetch[0], value);
  }
  const unavailable = createChannel({ message: null });
  const unavailableSession = createGuidePublicationResourceSession({ ensuredChannel: unavailable.channel });
  assert.deepEqual(await unavailableSession.lookupTrackedMessage('missing'), { available: false });
  await assert.rejects(() => unavailableSession.editTrackedMessage({}), /retained message/);
  const rejected = createChannel({ fetchError: new Error('fetch failed') });
  const rejectedSession = createGuidePublicationResourceSession({ ensuredChannel: rejected.channel });
  await assert.rejects(() => rejectedSession.lookupTrackedMessage('id'), /fetch failed/);
  assert.equal(rejected.calls.fetch.length, 1);
  const first = createGuidePublicationResourceSession({ ensuredChannel: channel });
  const secondChannel = createChannel({ message: null }).channel;
  const second = createGuidePublicationResourceSession({ ensuredChannel: secondChannel });
  await first.lookupTrackedMessage('first');
  assert.deepEqual(await second.lookupTrackedMessage('second'), { available: false });
  await assert.rejects(() => second.editTrackedMessage({}), /retained message/);
  console.log('Guide publication production resource session tests passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
