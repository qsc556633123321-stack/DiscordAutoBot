const assert = require('node:assert/strict');
const { createFakeCommunityGuideRuntimePersistenceRedirect } = require('../../fakes/community/FakeCommunityGuideRuntimePersistenceRedirect');

function runFuture(operation, persistedResult) {
  const calls = [];
  const redirect = createFakeCommunityGuideRuntimePersistenceRedirect({
    createGenericFeature() {
      calls.push('generic.create');
      return { persistCommunityPublicationRecord: { execute() { calls.push('persist.execute'); return persistedResult; } } };
    },
    createGuideFeature({ communityPublicationStateFeature }) {
      return { persist(request) { calls.push('guide.persist'); return communityPublicationStateFeature.persistCommunityPublicationRecord.execute(request); } };
    }
  });
  calls.push(operation);
  redirect.persistAfterGuideMutation({
    guild: { id: 'G' }, channel: { id: 'C' }, message: { id: `${operation}-M` },
    nativeTaskRecommendations: ['entry'], nativeTaskExcludedChannels: ['voice']
  });
  calls.push('return');
  return calls;
}

for (const operation of ['mutation.edit', 'mutation.send']) {
  for (const result of [{ persisted: true, record: {} }, { persisted: false, record: {} }]) {
    assert.deepEqual(runFuture(operation, result), [operation, 'generic.create', 'guide.persist', 'persist.execute', 'return']);
  }
}
console.log('Guide runtime redirect candidate keeps final Edit/Send mutation before one synchronous persistence attempt and return.');
