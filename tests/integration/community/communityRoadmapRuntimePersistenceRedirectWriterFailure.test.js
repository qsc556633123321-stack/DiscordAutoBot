const assert = require('node:assert/strict');
const {
  createFakeCommunityRoadmapRuntimePersistenceRedirect
} = require('../../fakes/community/FakeCommunityRoadmapRuntimePersistenceRedirect');

for (const message of [{ id: 'edit-message' }, { id: 'send-message' }]) {
  let calls = 0;
  const redirect = createFakeCommunityRoadmapRuntimePersistenceRedirect({
    communityPublicationStateFeature: {
      persistCommunityPublicationRecord: {
        execute() {
          calls += 1;
          return { persisted: false, record: { writerFailure: true } };
        }
      }
    }
  });
  const channel = { id: 'channel-1' };
  const result = redirect.persistAfterRoadmapMutation({ guild: { id: 'guild-1' }, channel, message });
  assert.equal(calls, 1);
  assert.strictEqual(result.channel, channel);
  assert.strictEqual(result.message, message);
}

console.log('Roadmap runtime persistence redirect candidate ignores writer-swallowed failure results.');
