const assert = require('node:assert/strict');
const {
  createCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');
const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');

assert.throws(() => createCommunityPublicationChannelTrackingReadCompatibilityAdapter(), TypeError);
for (const raw of ['guide-channel', undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
  let reads = 0;
  const adapter = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { reads += 1; return { 'guild-1': { guideChannelId: raw } }; } }
  });
  const result = adapter.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild-1', publication: 'guide' }));
  assert.equal(reads, 1);
  if (raw && typeof raw === 'object') assert.strictEqual(result.trackedChannelId, raw);
  else assert.strictEqual(result.trackedChannelId, raw);
  assert.deepEqual(Object.keys(result), ['trackedChannelId']);
  assert.equal(Object.isFrozen(result), true);
}
const missing = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ onboardingStateReader: { readOnboardingState: () => ({}) } });
assert.strictEqual(missing.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({ guildId: 'missing', publication: 'guide' })).trackedChannelId, undefined);
console.log('Channel tracking compatibility adapter preserves raw IDs, missing-guild behavior, and one-read semantics.');
