const assert = require('node:assert/strict');
const {
  createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter
} = require('../../fakes/community/FakeCommunityPublicationChannelTrackingReadCompatibilityAdapter');
const {
  createFakeCommunityPublicationChannelTrackingReadReaderAdapter
} = require('../../fakes/community/FakeCommunityPublicationChannelTrackingReadReaderAdapter');

for (const value of ['channel', undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
  let legacyReads = 0;
  let candidateReads = 0;
  const legacy = createFakeCommunityPublicationChannelTrackingReadCompatibilityAdapter({
    readOnboardingData() { legacyReads += 1; return { guild: { guideChannelId: value } }; }
  });
  const candidate = createFakeCommunityPublicationChannelTrackingReadReaderAdapter({
    onboardingStateReader: { readOnboardingState() { candidateReads += 1; return { guild: { guideChannelId: value } }; } }
  });
  assert.deepEqual(candidate.readTrackedChannel({ guildId: 'guild', publication: 'guide' }), legacy.readTrackedChannel({ guildId: 'guild', publication: 'guide' }));
  assert.equal(legacyReads, 1);
  assert.equal(candidateReads, 1);
}
let reads = 0;
const missing = createFakeCommunityPublicationChannelTrackingReadReaderAdapter({
  onboardingStateReader: { readOnboardingState() { reads += 1; return {}; } }
});
assert.equal(missing.readTrackedChannel({ guildId: 'missing' }).trackedChannelId, undefined);
assert.equal(reads, 1);
const sentinel = new Error('reader sentinel');
const throwing = createFakeCommunityPublicationChannelTrackingReadReaderAdapter({
  onboardingStateReader: { readOnboardingState() { throw sentinel; } }
});
assert.throws(() => throwing.readTrackedChannel({ guildId: 'guild' }), (error) => error === sentinel);
assert.throws(() => createFakeCommunityPublicationChannelTrackingReadReaderAdapter(), /requires onboardingStateReader/);
console.log('Channel tracking reader-adapter candidate preserves raw identity and one-read behavior.');
