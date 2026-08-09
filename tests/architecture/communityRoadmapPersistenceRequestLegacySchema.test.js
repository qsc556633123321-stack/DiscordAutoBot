const assert = require('node:assert/strict');
const {
  createRoadmapPublicationPersistenceRequest,
  mapRoadmapPublicationPersistenceRequestToGenericInput
} = require('../../src/application/community/roadmapPublication/RoadmapPublicationPersistenceRequest');

const output = mapRoadmapPublicationPersistenceRequestToGenericInput(
  createRoadmapPublicationPersistenceRequest({ guildId: 'G', channelId: 'C', messageId: 'M' })
);
assert.deepEqual(Object.keys(output), ['guildId', 'patch']);
assert.deepEqual(Object.keys(output.patch), ['roadmapChannelId', 'roadmapMessageId']);
assert.equal('roadmap' in output.patch, false);
assert.equal('channelId' in output.patch, false);
assert.equal('messageId' in output.patch, false);
console.log('Roadmap persistence request mapper emits only frozen legacy patch fields');
