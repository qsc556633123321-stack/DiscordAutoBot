const assert = require('node:assert/strict');
const path = require('node:path');
const cases = require(path.resolve(__dirname, '../../../fixtures/community/community-guide-resource-session-cases.json'));
const { createFakeGuidePublicationResourceSession } = require('../../../fakes/community/FakeGuidePublicationResourceSession');

(async () => {
  assert.equal(cases.length, 50);
  const channel = { id: 'channel-1', sent: [], async send(payload) { this.sent.push(payload); return { id: 'sent-1' }; } };
  const message = { id: 'message-1', edits: [], async edit(payload) { this.edits.push(payload); return this; } };
  const session = createFakeGuidePublicationResourceSession({ channel, message });
  assert.strictEqual(await session.lookupTrackedMessage('message-1'), message);
  await session.editTrackedMessage({ embeds: [] });
  assert.strictEqual(session.retainedMessage, message);
  assert.strictEqual(session.calls[0].channel, channel);
  assert.strictEqual(session.calls[1].message, message);
  assert.equal(message.edits.length, 1);
  const sendSession = createFakeGuidePublicationResourceSession({ channel });
  await sendSession.sendMessage({ content: 'guide' });
  assert.strictEqual(sendSession.calls[0].channel, channel);
  assert.equal(channel.sent.length, 1);
  console.log('Guide publication resource session continuity passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
