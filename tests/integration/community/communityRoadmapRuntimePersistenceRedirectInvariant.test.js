const assert = require('node:assert/strict');
const {
  createFakeCommunityRoadmapRuntimePersistenceRedirect
} = require('../../fakes/community/FakeCommunityRoadmapRuntimePersistenceRedirect');

for (const thrown of [new Error('invalid guild'), 'failure', 7, { kind: 'failure' }, null, undefined]) {
  let calls = 0;
  const redirect = createFakeCommunityRoadmapRuntimePersistenceRedirect({
    communityPublicationStateFeature: {
      persistCommunityPublicationRecord: {
        execute() {
          calls += 1;
          throw thrown;
        }
      }
    }
  });
  let caught = Symbol('not-thrown');
  try {
    redirect.persistAfterRoadmapMutation({
      guild: { id: 'guild-1' },
      channel: { id: 'channel-1' },
      message: { id: 'message-1' }
    });
  } catch (error) {
    caught = error;
  }
  assert.strictEqual(caught, thrown);
  assert.equal(calls, 1);
}

console.log('Roadmap runtime persistence redirect candidate preserves generic invariant throw identity.');
