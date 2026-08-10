const assert = require('node:assert/strict');
const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

function readGuide(record) {
  let reads = 0;
  const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
    readOnboardingData() {
      reads += 1;
      return { 'guild-guide': record };
    }
  });
  const request = createCommunityPublicationTrackingReadRequest({ guildId: 'guild-guide', publication: 'guide' });
  return { result: adapter.readTrackedMessage(request), reads };
}

for (const [raw, expected] of [
  ['guide-message', 'guide-message'],
  [undefined, undefined],
  [null, null],
  ['', ''],
  [false, false],
  [0, 0]
]) {
  const { result, reads } = readGuide({ guideMessageId: raw });
  assert.strictEqual(result.trackedMessageId, expected);
  assert.equal(reads, 1);
  assert.deepEqual(Object.keys(result), ['trackedMessageId']);
  assert.equal(Object.isFrozen(result), true);
}

const missingGuild = createCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData() { return {}; } });
const missingResult = missingGuild.readTrackedMessage(
  createCommunityPublicationTrackingReadRequest({ guildId: 'missing', publication: 'guide' })
);
assert.strictEqual(missingResult.trackedMessageId, undefined);

console.log('Guide tracking compatibility preserves valid, falsy, missing-guild, and single-read behavior.');
