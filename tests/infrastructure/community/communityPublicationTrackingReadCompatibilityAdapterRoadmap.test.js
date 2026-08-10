const assert = require('node:assert/strict');
const {
  createCommunityPublicationTrackingReadRequest
} = require('../../../src/application/community/ports/CommunityPublicationTrackingReadPort');
const {
  createCommunityPublicationTrackingReadCompatibilityAdapter
} = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');

function readRoadmap(record) {
  let reads = 0;
  const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({
    onboardingStateReader: { readOnboardingState() { reads += 1; return { 'guild-roadmap': record }; } }
  });
  const request = createCommunityPublicationTrackingReadRequest({ guildId: 'guild-roadmap', publication: 'roadmap' });
  return { result: adapter.readTrackedMessage(request), reads };
}

for (const [raw, expected] of [
  ['roadmap-message', 'roadmap-message'],
  [undefined, undefined],
  [null, null],
  ['', ''],
  [false, false],
  [0, 0]
]) {
  const { result, reads } = readRoadmap({ roadmapMessageId: raw });
  assert.strictEqual(result.trackedMessageId, expected);
  assert.equal(reads, 1);
  assert.deepEqual(Object.keys(result), ['trackedMessageId']);
  assert.equal(Object.isFrozen(result), true);
}

const missingGuild = createCommunityPublicationTrackingReadCompatibilityAdapter({ onboardingStateReader: { readOnboardingState() { return {}; } } });
const missingResult = missingGuild.readTrackedMessage(
  createCommunityPublicationTrackingReadRequest({ guildId: 'missing', publication: 'roadmap' })
);
assert.strictEqual(missingResult.trackedMessageId, undefined);

console.log('Roadmap tracking compatibility preserves valid, falsy, missing-guild, and single-read behavior.');
