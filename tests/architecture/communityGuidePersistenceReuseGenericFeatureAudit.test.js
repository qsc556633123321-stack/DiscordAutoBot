const assert = require('node:assert/strict');
const { createCommunityPublicationStateFeature } = require('../../src/composition/communityPublicationStateFeature');

const feature = createCommunityPublicationStateFeature({
  repository: { mergeRecord(input) { return { persisted: true, record: input }; } },
  now: () => 'STAMP'
});
assert.deepEqual(Object.keys(feature), ['persistCommunityPublicationRecord']);
assert.equal(typeof feature.persistCommunityPublicationRecord.execute, 'function');
assert.deepEqual(feature.persistCommunityPublicationRecord.execute({ guildId: 'G', patch: { guideMessageId: 'M' } }), {
  persisted: true,
  record: { guildId: 'G', patch: { guideMessageId: 'M' }, updatedAt: 'STAMP' }
});
console.log('Guide reuse preparation audits the existing generic composition execute surface');
