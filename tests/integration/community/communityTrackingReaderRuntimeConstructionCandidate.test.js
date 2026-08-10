const assert = require('node:assert/strict');
const { createFakeCommunityTrackingReaderRuntimeConstruction } = require('../../fakes/community/FakeCommunityTrackingReaderRuntimeConstruction');

let reads = 0;
const runtime = createFakeCommunityTrackingReaderRuntimeConstruction({
  filePath: 'onboarding.json',
  readJson(filePath, fallback) {
    reads += 1;
    assert.equal(filePath, 'onboarding.json');
    assert.deepEqual(fallback, {});
    return { guild: { guideMessageId: 'guide', roadmapMessageId: 'roadmap', guideChannelId: 'channel' } };
  }
});
assert.equal(runtime.createMessageAdapter().readTrackedMessage({ guildId: 'guild', publication: 'guide' }).trackedMessageId, 'guide');
assert.equal(runtime.createMessageAdapter().readTrackedMessage({ guildId: 'guild', publication: 'roadmap' }).trackedMessageId, 'roadmap');
assert.equal(runtime.createChannelAdapter().readTrackedChannel({ guildId: 'guild', publication: 'guide' }).trackedChannelId, 'channel');
assert.equal(reads, 3, 'each Guide, Roadmap, and Welcome candidate invocation builds one reader and reads once');
console.log('Runtime construction candidate is per invocation and needs no Composition feature.');
