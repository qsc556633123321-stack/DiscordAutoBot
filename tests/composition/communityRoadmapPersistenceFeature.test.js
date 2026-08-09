const assert = require('node:assert/strict');
const { createCommunityRoadmapPersistenceFeature } = require('../../src/composition/communityRoadmapPersistenceFeature');
const { createRoadmapPublicationPersistenceRequest } = require('../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');
const { createCommunityPublicationStateFeature } = require('../../src/composition/communityPublicationStateFeature');

function createFeature(execute) {
  return createCommunityRoadmapPersistenceFeature({
    communityPublicationStateFeature: {
      persistCommunityPublicationRecord: { execute }
    }
  });
}

const request = createRoadmapPublicationPersistenceRequest({
  guildId: 'guild-1',
  channelId: 'roadmap-channel-1',
  messageId: 'roadmap-message-1'
});

let calls = 0;
let genericInput;
const successResult = { persisted: true, record: { roadmapMessageId: 'roadmap-message-1' } };
const feature = createFeature((input) => {
  calls += 1;
  genericInput = input;
  return successResult;
});

assert.deepEqual(Object.keys(feature), ['persist']);
const returned = feature.persist(request);
assert.strictEqual(returned, successResult);
assert.equal(calls, 1);
assert.deepEqual(genericInput, {
  guildId: 'guild-1',
  patch: {
    roadmapChannelId: 'roadmap-channel-1',
    roadmapMessageId: 'roadmap-message-1'
  }
});
assert.equal(typeof returned?.then, 'undefined');

const writeFailure = { persisted: false, record: { roadmapMessageId: 'roadmap-message-1' } };
assert.strictEqual(createFeature(() => writeFailure).persist(request), writeFailure);

for (const thrown of [new Error('invariant'), 'string failure', 7, { reason: 'object failure' }, null, undefined]) {
  const throwingFeature = createFeature(() => {
    throw thrown;
  });
  let caught = Symbol('not-thrown');
  try {
    throwingFeature.persist(request);
  } catch (error) {
    caught = error;
  }
  assert.strictEqual(caught, thrown);
}

const records = {
  'guild-1': { guideMessageId: 'guide-message-1', unknown: true },
  'guild-2': { welcomeMessageId: 'welcome-message-2' }
};
const genericFeature = createCommunityPublicationStateFeature({
  repository: {
    mergeRecord(input) {
      records[input.guildId] = {
        ...records[input.guildId],
        ...input.patch,
        updatedAt: input.updatedAt
      };
      return { persisted: true, record: records[input.guildId] };
    }
  },
  now: () => '2026-08-09T00:00:00.000Z'
});
const reusedFeature = createCommunityRoadmapPersistenceFeature({
  communityPublicationStateFeature: genericFeature
});
const coexistenceResult = reusedFeature.persist(request);
assert.equal(coexistenceResult.record.guideMessageId, 'guide-message-1');
assert.equal(coexistenceResult.record.unknown, true);
assert.equal(coexistenceResult.record.roadmapChannelId, 'roadmap-channel-1');
assert.equal(coexistenceResult.record.updatedAt, '2026-08-09T00:00:00.000Z');
assert.deepEqual(records['guild-2'], { welcomeMessageId: 'welcome-message-2' });
reusedFeature.persist(createRoadmapPublicationPersistenceRequest({
  guildId: 'guild-2',
  channelId: 'roadmap-channel-2',
  messageId: 'roadmap-message-2'
}));
assert.equal(records['guild-1'].roadmapMessageId, 'roadmap-message-1');
assert.equal(records['guild-2'].roadmapMessageId, 'roadmap-message-2');

console.log('Community Roadmap persistence reuse feature tests passed.');
