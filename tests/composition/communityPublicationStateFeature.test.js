const assert = require('node:assert/strict');
const { createCommunityPublicationStateFeature } = require('../../src/composition/communityPublicationStateFeature');

const calls = [];
const feature = createCommunityPublicationStateFeature({
  repository: {
    mergeRecord(input) {
      calls.push(input);
      return { persisted: true, record: input.patch };
    }
  },
  now: () => '2026-08-08T00:00:00.000Z'
});

const result = feature.persistCommunityPublicationRecord.execute({
  guildId: 'guild-1',
  patch: { roadmapMessageId: 'roadmap-1' }
});
assert.deepEqual(Object.keys(feature), ['persistCommunityPublicationRecord']);
assert.equal(result.persisted, true);
assert.equal(calls[0].updatedAt, '2026-08-08T00:00:00.000Z');

console.log('Community publication persistence composition tests passed.');
