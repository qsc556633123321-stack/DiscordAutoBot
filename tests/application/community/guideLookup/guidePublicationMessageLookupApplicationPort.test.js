const assert = require('node:assert/strict');
const {
  assertGuidePublicationMessageLookupPort,
  GuidePublicationMessageLookupStatus,
  createGuidePublicationMessageLookupRequest,
  createLookupSkipped,
  createMessageAvailable,
  createMessageUnavailable
} = require('../../../../src/application/community');
const { createFakeGuidePublicationMessageLookupPort } = require('../../../fakes/community/FakeGuidePublicationMessageLookupPort');

assert.doesNotThrow(() => assertGuidePublicationMessageLookupPort({ lookup() {} }));
assert.throws(() => assertGuidePublicationMessageLookupPort({}), /lookup method/);
const opaque = { legacy: true };
const request = createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c', messageId: opaque });
assert.deepEqual(request, { guildId: 'g', channelId: 'c', messageId: opaque });
assert.equal(request.messageId, opaque);
assert.equal(Object.isFrozen(request), true);
assert.throws(() => createGuidePublicationMessageLookupRequest({ channelId: 'c', messageId: 'm' }), /guildId/);
assert.throws(() => createGuidePublicationMessageLookupRequest({ guildId: 'g', messageId: 'm' }), /channelId/);
assert.throws(() => createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c' }), /messageId/);
const fake = createFakeGuidePublicationMessageLookupPort([
  createMessageAvailable({ messageId: 'first' }),
  createMessageUnavailable({ messageId: 'second' })
]);
assert.equal(fake.lookup(createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c', messageId: 'first' })).status, GuidePublicationMessageLookupStatus.MessageAvailable);
assert.equal(fake.lookup(createGuidePublicationMessageLookupRequest({ guildId: 'g', channelId: 'c', messageId: 'second' })).status, GuidePublicationMessageLookupStatus.MessageUnavailable);
assert.equal(fake.calls.length, 2);
for (const result of [
  createLookupSkipped({ messageId: 'm' }),
  createMessageAvailable({ messageId: 'm' }),
  createMessageUnavailable({ messageId: 'm' })
]) {
  assert.equal(Object.isFrozen(result), true);
  assert.ok(Object.values(GuidePublicationMessageLookupStatus).includes(result.status));
  assert.equal('failureKind' in result, false);
  assert.equal('message' in result, false);
  assert.equal('channel' in result, false);
  assert.equal('error' in result, false);
}
console.log('Guide publication message lookup Application port passed');
