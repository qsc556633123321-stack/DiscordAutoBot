const assert = require('node:assert/strict');
const { createCommunityGuidePersistenceFeature } = require('../../src/composition/communityGuidePersistenceFeature');
const { createGuidePersistenceRequest } = require('../../src/application/community/guidePublication/GuidePersistenceRequest');
const { createCommunityPublicationStateFeature } = require('../../src/composition/communityPublicationStateFeature');

function createFeature(execute) {
  return createCommunityGuidePersistenceFeature({
    communityPublicationStateFeature: { persistCommunityPublicationRecord: { execute } }
  });
}

const recommendations = [{ channel: 'guide' }];
const excluded = ['voice-hub'];
const request = createGuidePersistenceRequest({
  guildId: 'G', channelId: 'C', messageId: 'M',
  nativeTaskRecommendations: recommendations,
  nativeTaskExcludedChannels: excluded
});
let calls = 0;
let genericInput;
const success = { persisted: true, record: { guideMessageId: 'M' } };
const feature = createFeature((input) => {
  calls += 1;
  genericInput = input;
  return success;
});

assert.deepEqual(Object.keys(feature), ['persist']);
assert.strictEqual(feature.persist(request), success);
assert.equal(calls, 1);
assert.deepEqual(genericInput, {
  guildId: 'G',
  patch: {
    guideChannelId: 'C',
    guideMessageId: 'M',
    nativeTaskRecommendations: recommendations,
    nativeTaskExcludedChannels: excluded
  }
});
assert.strictEqual(genericInput.patch.nativeTaskRecommendations, recommendations);
assert.strictEqual(genericInput.patch.nativeTaskExcludedChannels, excluded);
assert.equal(typeof success?.then, 'undefined');

const writeFailure = { persisted: false, record: { guideMessageId: 'M' } };
let failureCalls = 0;
assert.strictEqual(createFeature(() => { failureCalls += 1; return writeFailure; }).persist(request), writeFailure);
assert.equal(failureCalls, 1);

for (const thrown of [new Error('invariant'), 'string failure', 7, { reason: 'object failure' }, null, undefined]) {
  let throwCalls = 0;
  const throwing = createFeature(() => { throwCalls += 1; throw thrown; });
  let caught = Symbol('not-thrown');
  try { throwing.persist(request); } catch (error) { caught = error; }
  assert.strictEqual(caught, thrown);
  assert.equal(throwCalls, 1);
}

const records = {
  G: { roadmapMessageId: 'R-M', welcome: { keep: true }, unknown: true },
  other: { guideMessageId: 'other-message' }
};
const genericFeature = createCommunityPublicationStateFeature({
  repository: {
    mergeRecord(input) {
      records[input.guildId] = { ...records[input.guildId], ...input.patch, updatedAt: input.updatedAt };
      return { persisted: true, record: records[input.guildId] };
    }
  },
  now: () => 'STAMP'
});
const reused = createCommunityGuidePersistenceFeature({ communityPublicationStateFeature: genericFeature });
const coexistence = reused.persist(request);
assert.equal(coexistence.record.roadmapMessageId, 'R-M');
assert.deepEqual(coexistence.record.welcome, { keep: true });
assert.equal(coexistence.record.unknown, true);
assert.equal(coexistence.record.updatedAt, 'STAMP');
assert.deepEqual(records.other, { guideMessageId: 'other-message' });

console.log('Community Guide persistence reuse feature tests passed.');
