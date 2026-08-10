const assert = require('node:assert/strict');
const { createFakeProductionShapeGuideTrackedStateRead } = require('../../fakes/community/FakeProductionShapeGuideTrackedStateRead');
const { createFakeCommunityPublicationTrackingReadPort } = require('../../fakes/community/FakeCommunityPublicationTrackingReadPort');
const { createFakeCommunityPublicationTrackingReadCompatibilityAdapter } = require('../../fakes/community/FakeCommunityPublicationTrackingReadCompatibilityAdapter');

for (const value of ['R', '', null, undefined, false, 0, 123, {}, [], true, '   ']) {
  let legacyReads = 0;
  let candidateReads = 0;
  const records = { 'guild exact ': { roadmapMessageId: value } };
  const legacy = createFakeProductionShapeGuideTrackedStateRead({ readOnboardingData() { legacyReads += 1; return records; } });
  const adapter = createFakeCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData() { candidateReads += 1; return records; } });
  const candidate = createFakeCommunityPublicationTrackingReadPort({ adapter });
  const legacyId = legacy.getTrackedPublicationMessageId({ guildId: 'guild exact ', publication: 'roadmap' });
  const result = candidate.readTrackedMessage({ guildId: 'guild exact ', publication: 'roadmap' });
  assert.deepEqual(result.trackedMessageId, legacyId);
  assert.equal(Boolean(result.trackedMessageId), Boolean(legacyId));
  assert.equal(legacyReads, 1);
  assert.equal(candidateReads, 1);
}
console.log('Roadmap shared tracking query candidate preserves legacy tracked-ID and lookup-decision equivalence.');
