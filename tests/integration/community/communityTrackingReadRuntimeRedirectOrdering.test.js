const assert = require('node:assert/strict');
const { createFakeCommunityGuideTrackingReadRuntimeRedirect } = require('../../fakes/community/FakeCommunityGuideTrackingReadRuntimeRedirect');
const { createFakeCommunityRoadmapTrackingReadRuntimeRedirect } = require('../../fakes/community/FakeCommunityRoadmapTrackingReadRuntimeRedirect');

async function verify(createCandidate, publication) {
  const field = `${publication}MessageId`;
  const events = [];
  const candidate = createCandidate({
    readOnboardingData() {
      events.push('read');
      return { 'guild-order': { [field]: 'tracked-id' } };
    }
  });
  await candidate.execute({
    guildId: 'guild-order',
    lookup() { events.push('lookup'); },
    mutate() { events.push('mutation'); },
    persist() { events.push('persistence'); }
  });
  assert.deepEqual(events, ['read', 'lookup', 'mutation', 'persistence']);
}

(async () => {
  await verify(createFakeCommunityGuideTrackingReadRuntimeRedirect, 'guide');
  await verify(createFakeCommunityRoadmapTrackingReadRuntimeRedirect, 'roadmap');
  console.log('Combined tracking-read redirect candidates retain read, lookup, mutation, persistence ordering.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
