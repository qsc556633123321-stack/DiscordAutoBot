const assert = require('node:assert/strict');
const { fromLegacyPublicationRecord } = require('../../../src/application/community/communityPublicationStateMapper');
const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

function deriveLegacyTrackedMessageId(guildId, data, publication) {
  const state = fromLegacyPublicationRecord(guildId, data);
  return publication === 'guide'
    ? state.guide.messageId || data.guideMessageId
    : state.roadmap.messageId || data.roadmapMessageId;
}

for (const publication of ['guide', 'roadmap']) {
  const field = `${publication}MessageId`;
  for (const raw of ['valid-id', undefined, null, '', false, 0, 123, true, {}, [], '   ']) {
    let reads = 0;
    const record = { [field]: raw };
    const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
      readOnboardingData() {
        reads += 1;
        return { 'guild-equivalence': record };
      }
    });
    const result = adapter.readTrackedMessage(
      createCommunityPublicationTrackingReadRequest({ guildId: 'guild-equivalence', publication })
    );
    const legacyTrackedMessageId = deriveLegacyTrackedMessageId('guild-equivalence', record, publication);
    assert.strictEqual(result.trackedMessageId, legacyTrackedMessageId, `${publication} must preserve legacy mapping`);
    assert.equal(Boolean(result.trackedMessageId), Boolean(legacyTrackedMessageId), 'lookup/send branch decision must match');
    assert.equal(reads, 1, `${publication} must make one reader call`);
  }
}

console.log('Production shared tracking read adapter matches Guide and Roadmap legacy lookup decisions.');
