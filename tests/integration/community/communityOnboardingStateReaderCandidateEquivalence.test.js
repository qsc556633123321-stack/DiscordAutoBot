const assert = require('node:assert/strict');
const { createFakeCommunityOnboardingStateReader } = require('../../fakes/community/FakeCommunityOnboardingStateReader');

function verify(expected) {
  let reads = 0;
  const reader = createFakeCommunityOnboardingStateReader({
    readRoot() { reads += 1; return expected; }
  });
  assert.equal(reader.readOnboardingState(), expected);
  assert.equal(reads, 1);
}

verify({ 'guild-1': { guideMessageId: 'guide-message' }, 'guild-2': { roadmapMessageId: 'roadmap-message' } });
verify({}); // missing-file, invalid-JSON, and read-error compatibility fallback
verify({ 'guild-1': {} });
assert.throws(() => createFakeCommunityOnboardingStateReader(), /requires readRoot/);
console.log('Test-only onboarding state reader preserves one-read root passthrough and compatibility fallback ownership.');
