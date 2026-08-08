const assert = require('node:assert/strict');
const { createGuidePublicationMessageLookupDiscordAdapter } = require('../../../../src/infrastructure/community/guidePublication/GuidePublicationMessageLookupDiscordAdapter');

(async () => {
  assert.throws(() => createGuidePublicationMessageLookupDiscordAdapter(), /requires a session/);
  assert.throws(() => createGuidePublicationMessageLookupDiscordAdapter({ session: {} }), /requires a session/);
  const calls = [];
  const adapter = createGuidePublicationMessageLookupDiscordAdapter({
    session: { async lookupTrackedMessage(id) { calls.push(id); return { available: true }; } }
  });
  const objectId = { opaque: true };
  assert.deepEqual(await adapter.lookup({ messageId: objectId }), { status: 'MessageAvailable', messageId: objectId });
  assert.strictEqual(calls[0], objectId);
  for (const messageId of [42, ['id'], true, '  id  ']) {
    await adapter.lookup({ messageId });
    assert.strictEqual(calls.at(-1), messageId);
  }
  const unavailable = await createGuidePublicationMessageLookupDiscordAdapter({
    session: { async lookupTrackedMessage() { return { available: false }; } }
  }).lookup({ messageId: 'missing' });
  assert.deepEqual(unavailable, { status: 'MessageUnavailable', messageId: 'missing' });
  const rejected = await createGuidePublicationMessageLookupDiscordAdapter({
    session: { async lookupTrackedMessage() { throw new Error('fetch failure'); } }
  }).lookup({ messageId: 'rejected' });
  assert.deepEqual(rejected, { status: 'MessageUnavailable', messageId: 'rejected' });
  assert.equal('failureKind' in rejected, false);
  assert.equal(rejected.status === 'LookupSkipped', false);
  console.log('Guide production lookup Discord adapter tests passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
