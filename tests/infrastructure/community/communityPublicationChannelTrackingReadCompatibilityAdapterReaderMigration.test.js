const assert = require('node:assert/strict');
const {
  createCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');

assert.throws(
  () => createCommunityPublicationChannelTrackingReadCompatibilityAdapter(),
  { name: 'TypeError', message: 'CommunityPublicationChannelTrackingReadCompatibilityAdapter requires onboardingStateReader' }
);
for (const value of [undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
  let reads = 0;
  const root = Object.freeze({ guild: { guideChannelId: value } });
  const adapter = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { reads += 1; return root; } }
  });
  const result = adapter.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild', publication: 'guide' }));
  assert.equal(reads, 1);
  assert.strictEqual(result.trackedChannelId, value);
  assert.equal(Object.isFrozen(result), true);
}
const sentinel = new Error('channel sentinel');
const adapter = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({
  onboardingStateReader: { readOnboardingState() { throw sentinel; } }
});
assert.throws(() => adapter.readTrackedChannel({ guildId: 'guild' }), (error) => error === sentinel);
console.log('Channel tracking adapter requires the reader object, preserves raw IDs, and propagates reader throws.');
