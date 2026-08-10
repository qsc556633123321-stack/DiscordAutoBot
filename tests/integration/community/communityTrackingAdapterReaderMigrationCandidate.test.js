const assert = require('node:assert/strict');
const {
  createFakeCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../fakes/community/FakeCommunityPublicationTrackingReadCompatibilityAdapter');
const {
  createFakeCommunityPublicationTrackingReadReaderAdapter
} = require('../../fakes/community/FakeCommunityPublicationTrackingReadReaderAdapter');

function compare(publication, record) {
  let legacyReads = 0;
  let candidateReads = 0;
  const legacy = createFakeCommunityPublicationTrackingReadCompatibilityAdapter({
    readOnboardingData() { legacyReads += 1; return { guild: record }; }
  });
  const candidate = createFakeCommunityPublicationTrackingReadReaderAdapter({
    onboardingStateReader: {
      readOnboardingState() { candidateReads += 1; return { guild: record }; }
    }
  });
  const request = { guildId: 'guild', publication };
  assert.deepEqual(candidate.readTrackedMessage(request), legacy.readTrackedMessage(request));
  assert.equal(legacyReads, 1);
  assert.equal(candidateReads, 1);
}

compare('guide', { guide: { messageId: 'guide-normalized' }, guideMessageId: 'guide-raw' });
compare('roadmap', { roadmap: { messageId: 'roadmap-normalized' }, roadmapMessageId: 'roadmap-raw' });
for (const value of [undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
  compare('guide', { guideMessageId: value });
  compare('roadmap', { roadmapMessageId: value });
}
let missingReads = 0;
const missing = createFakeCommunityPublicationTrackingReadReaderAdapter({
  onboardingStateReader: { readOnboardingState() { missingReads += 1; return {}; } }
});
assert.equal(missing.readTrackedMessage({ guildId: 'missing', publication: 'guide' }).trackedMessageId, undefined);
assert.equal(missingReads, 1);
const sentinel = new Error('reader sentinel');
const throwing = createFakeCommunityPublicationTrackingReadReaderAdapter({
  onboardingStateReader: { readOnboardingState() { throw sentinel; } }
});
assert.throws(() => throwing.readTrackedMessage({ guildId: 'guild', publication: 'guide' }), (error) => error === sentinel);
assert.throws(() => createFakeCommunityPublicationTrackingReadReaderAdapter(), /requires onboardingStateReader/);
console.log('Message tracking reader-adapter candidate preserves mapper, fallback, identity, and one-read behavior.');
