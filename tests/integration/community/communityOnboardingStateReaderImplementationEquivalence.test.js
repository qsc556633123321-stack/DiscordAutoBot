const assert = require('node:assert/strict');
const { createCommunityOnboardingStateReader } = require('../../../src/infrastructure/community/CommunityOnboardingStateReader');

function legacyCompatibleJsonReader(value, log) {
  return {
    readRoot(fallback) {
    log.push({ fallback });
    return value;
    }
  };
}

for (const value of [
  {},
  { 'guild-1': { guideMessageId: 'guide-message', roadmapMessageId: 'roadmap-message', guideChannelId: 'guide-channel' } }
]) {
  const log = [];
  const reader = createCommunityOnboardingStateReader({ onboardingJsonReader: legacyCompatibleJsonReader(value, log) });
  assert.strictEqual(reader.readOnboardingState(), value);
  assert.deepEqual(log, [{ fallback: {} }]);
}

for (const compatibilityFallback of ['missing-file', 'malformed-json', 'read-error', 'empty-file', 'null-root', 'array-root']) {
  const log = [];
  const reader = createCommunityOnboardingStateReader({ onboardingJsonReader: legacyCompatibleJsonReader({}, log) });
  assert.deepEqual(reader.readOnboardingState(), {}, compatibilityFallback);
  assert.equal(log.length, 1);
}
console.log('Production onboarding state reader preserves injected legacy-compatible fallback and root identity behavior.');
