const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimePersistenceRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimePersistenceRedirect');

function createCandidate(execute) {
  return createFakeCommunityGuideRuntimePersistenceRedirect({
    createGenericFeature() { return { persistCommunityPublicationRecord: { execute } }; }
  });
}
const input = {
  guild: { id: 'G' }, channel: { id: 'C' }, message: { id: 'M' },
  nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice']
};
let writes = 0;
assert.strictEqual(createCandidate(() => { writes += 1; return { persisted: false, record: {} }; }).persistAfterGuideMutation(input), undefined);
assert.equal(writes, 1);
for (const thrown of [new Error('invariant'), 'string', 7, { object: true }, null, undefined]) {
  let count = 0;
  const candidate = createCandidate(() => { count += 1; throw thrown; });
  let caught = Symbol('not-thrown');
  try { candidate.persistAfterGuideMutation(input); } catch (error) { caught = error; }
  assert.strictEqual(caught, thrown);
  assert.equal(count, 1);
}
console.log('Guide runtime redirect candidate preserves writer partial success and exact generic invariant failures without retry.');
