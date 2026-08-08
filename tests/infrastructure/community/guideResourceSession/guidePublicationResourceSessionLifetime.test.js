const assert = require('node:assert/strict');
const { createFakeGuidePublicationResourceSession } = require('../../../fakes/community/FakeGuidePublicationResourceSession');

(async () => {
  const channelA = { id: 'a', async send() {} };
  const channelB = { id: 'b', async send() {} };
  const messageA = { id: 'ma', async edit() {} };
  const messageB = { id: 'mb', async edit() {} };
  const sessionA = createFakeGuidePublicationResourceSession({ channel: channelA, message: messageA });
  const sessionB = createFakeGuidePublicationResourceSession({ channel: channelB, message: messageB });
  await Promise.all([sessionA.lookupTrackedMessage('ma'), sessionB.lookupTrackedMessage('mb')]);
  assert.strictEqual(sessionA.channel, channelA);
  assert.strictEqual(sessionB.channel, channelB);
  assert.strictEqual(sessionA.retainedMessage, messageA);
  assert.strictEqual(sessionB.retainedMessage, messageB);
  assert.notStrictEqual(sessionA, sessionB);
  console.log('Guide publication resource session lifetime passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
