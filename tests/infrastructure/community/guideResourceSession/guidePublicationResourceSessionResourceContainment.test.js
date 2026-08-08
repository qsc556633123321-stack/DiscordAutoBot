const assert = require('node:assert/strict');
const { createGuidePublicationResourceSession } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationResourceSession');

(async () => {
  const channel = { id: 'channel-id', messages: { async fetch() { return { id: 'message-id', async edit() {} }; } }, async send() { return { id: 'sent-id' }; } };
  const session = createGuidePublicationResourceSession({ ensuredChannel: channel });
  assert.deepEqual(Object.keys(session).sort(), ['editTrackedMessage', 'getChannelId', 'getRetainedMessage', 'lookupTrackedMessage', 'sendMessage']);
  assert.equal(session.getChannelId(), 'channel-id');
  const lookup = await session.lookupTrackedMessage('message-id');
  assert.deepEqual(lookup, { available: true });
  assert.equal('channel' in lookup, false);
  assert.equal('message' in lookup, false);
  assert.equal('guild' in lookup, false);
  assert.equal('client' in lookup, false);
  assert.equal(session.getRetainedMessage().id, 'message-id');
  console.log('Guide publication production resource containment passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
