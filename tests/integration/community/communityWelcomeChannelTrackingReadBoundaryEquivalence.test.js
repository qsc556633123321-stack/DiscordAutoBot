const assert = require('node:assert/strict');
const {
  createCommunityPublicationChannelTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationChannelTrackingReadPort');
const {
  createCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');

function assertLegacyEquivalent(raw, records = { 'guild-1': { guideChannelId: raw } }) {
  let reads = 0;
  const adapter = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { reads += 1; return records; } }
  });
  const result = adapter.readTrackedChannel(createCommunityPublicationChannelTrackingReadRequest({ guildId: 'guild-1', publication: 'guide' }));
  const legacy = (records['guild-1'] || {}).guideChannelId;
  assert.equal(reads, 1);
  if (raw && typeof raw === 'object') assert.strictEqual(result.trackedChannelId, legacy);
  else assert.strictEqual(result.trackedChannelId, legacy);
}

for (const raw of ['guide-channel', undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
  assertLegacyEquivalent(raw);
}
assertLegacyEquivalent(undefined, {});
console.log('Production channel tracking boundary matches the legacy guideChannelId expression with one compatibility read.');
