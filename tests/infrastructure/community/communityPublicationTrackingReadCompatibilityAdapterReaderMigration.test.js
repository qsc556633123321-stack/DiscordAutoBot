const assert = require('node:assert/strict');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');
const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');

assert.throws(
  () => createCommunityPublicationTrackingReadCompatibilityAdapter(),
  { name: 'TypeError', message: 'CommunityPublicationTrackingReadCompatibilityAdapter requires onboardingStateReader' }
);
for (const publication of ['guide', 'roadmap']) {
  let reads = 0;
  const root = Object.freeze({ guild: publication === 'guide'
    ? { guideMessageId: {} }
    : { roadmapMessageId: [] } });
  const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { reads += 1; return root; } }
  });
  const result = adapter.readTrackedMessage(createCommunityPublicationTrackingReadRequest({ guildId: 'guild', publication }));
  assert.equal(reads, 1);
  assert.strictEqual(result.trackedMessageId, publication === 'guide' ? root.guild.guideMessageId : root.guild.roadmapMessageId);
  assert.deepEqual(Object.keys(root), ['guild']);
  assert.equal(Object.isFrozen(result), true);
}
for (const thrown of [new Error('sentinel'), 'sentinel', 7, { sentinel: true }, null, undefined]) {
  const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { throw thrown; } }
  });
  assert.throws(
    () => adapter.readTrackedMessage(createCommunityPublicationTrackingReadRequest({ guildId: 'guild', publication: 'guide' })),
    (error) => error === thrown
  );
}
console.log('Message tracking adapter requires the reader object, reads once, preserves raw fallback, and propagates reader throws.');
