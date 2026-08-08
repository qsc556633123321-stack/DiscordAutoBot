const assert = require('node:assert/strict');
const { createFakeGuidePublicationMessageLookupSessionAdapter } = require('../../../fakes/community/FakeGuidePublicationMessageLookupSessionAdapter');

(async () => {
  assert.throws(() => createFakeGuidePublicationMessageLookupSessionAdapter(), /requires a session/);
  const calls = [];
  const messageId = { opaque: true };
  const adapter = createFakeGuidePublicationMessageLookupSessionAdapter({
    session: { async lookupTrackedMessage(id) { calls.push(id); return { available: true }; } }
  });
  const result = await adapter.lookup({ guildId: 'g', channelId: 'c', messageId });
  assert.strictEqual(calls[0], messageId);
  assert.deepEqual(result, { status: 'MessageAvailable', messageId });
  assert.equal('message' in result, false);
  assert.equal('error' in result, false);
  const unavailable = await createFakeGuidePublicationMessageLookupSessionAdapter({
    session: { async lookupTrackedMessage() { return { available: false }; } }
  }).lookup({ messageId: 'missing' });
  assert.deepEqual(unavailable, { status: 'MessageUnavailable', messageId: 'missing' });
  const rejected = await createFakeGuidePublicationMessageLookupSessionAdapter({
    session: { async lookupTrackedMessage() { throw new Error('fetch failed'); } }
  }).lookup({ messageId: 'rejected' });
  assert.deepEqual(rejected, { status: 'MessageUnavailable', messageId: 'rejected' });
  console.log('Guide lookup adapter session contract preparation passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
