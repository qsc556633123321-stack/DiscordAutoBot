const assert = require('node:assert/strict');
const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

for (const publication of ['guide', 'roadmap']) {
  const field = `${publication}MessageId`;
  for (const raw of [123, true, {}, [], '   ']) {
    const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
      readOnboardingData() {
        return { 'guild-raw': { [field]: raw } };
      }
    });
    const result = adapter.readTrackedMessage(
      createCommunityPublicationTrackingReadRequest({ guildId: 'guild-raw', publication })
    );
    assert.strictEqual(result.trackedMessageId, raw, `${publication} must return its exact raw truthy fallback`);
  }
}

console.log('Shared tracking read preserves exact truthy malformed legacy message IDs.');
