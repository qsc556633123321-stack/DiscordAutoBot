const assert = require('node:assert/strict');
const { createFakeCommunityOnboardingStateReaderV2 } = require('../../fakes/community/FakeCommunityOnboardingStateReaderV2');
const { createCommunityPublicationTrackingReadCompatibilityAdapter } = require('../../../src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter');
const { createCommunityPublicationChannelTrackingReadCompatibilityAdapter } = require('../../../src/infrastructure/community/CommunityPublicationChannelTrackingReadCompatibilityAdapter');

function createReader(result, log) {
  return createFakeCommunityOnboardingStateReaderV2({
    filePath: 'onboarding-flows.json',
    readJson(filePath, fallback) {
      log.push({ filePath, fallback });
      return result;
    }
  });
}

for (const result of [
  {},
  { 'guild-1': {} },
  { 'guild-1': { guideMessageId: 'guide-message', roadmapMessageId: 'roadmap-message', guideChannelId: 'guide-channel' }, 'guild-2': { retained: true } }
]) {
  const log = [];
  const reader = createReader(result, log);
  assert.equal(reader.readOnboardingState(), result, 'raw root identity must be preserved');
  assert.deepEqual(log, [{ filePath: 'onboarding-flows.json', fallback: {} }]);
}

for (const rawRoot of [null, [], 'text', 42, true]) {
  const log = [];
  const reader = createReader({}, log);
  assert.deepEqual(reader.readOnboardingState(), {}, `legacy readJson absorbs ${typeof rawRoot} roots as the fallback`);
  assert.equal(log.length, 1, 'candidate delegates all fallback semantics once to readJson');
}

const root = { 'guild-1': { guideMessageId: 'guide-message', roadmapMessageId: 'roadmap-message', guideChannelId: 'guide-channel' } };
for (const publication of ['guide', 'roadmap']) {
  let reads = 0;
  const reader = createFakeCommunityOnboardingStateReaderV2({ filePath: 'onboarding-flows.json', readJson() { reads += 1; return root; } });
  const adapter = createCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData: () => reader.readOnboardingState() });
  assert.equal(adapter.readTrackedMessage({ guildId: 'guild-1', publication }).trackedMessageId, `${publication}-message`);
  assert.equal(reads, 1);
}
let channelReads = 0;
const channelReader = createFakeCommunityOnboardingStateReaderV2({ filePath: 'onboarding-flows.json', readJson() { channelReads += 1; return root; } });
const channelAdapter = createCommunityPublicationChannelTrackingReadCompatibilityAdapter({ readOnboardingData: () => channelReader.readOnboardingState() });
assert.equal(channelAdapter.readTrackedChannel({ guildId: 'guild-1', publication: 'guide' }).trackedChannelId, 'guide-channel');
assert.equal(channelReads, 1);
console.log('Onboarding state reader candidate preserves delegated filesystem semantics, raw root identity, and one-read adapter integration.');
