const assert = require('node:assert/strict');
const {
  createRoadmapPublicationMessageEditRequest,
  createRoadmapPublicationMessageSendRequest
} = require('../../../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort');

const payload = { embeds: [{ title: 'Roadmap', fields: [{ name: 'x', value: 'y' }] }] };
const edit = createRoadmapPublicationMessageEditRequest({ messageId: 'M', payload });
const send = createRoadmapPublicationMessageSendRequest({ payload });
assert.equal(edit.payload, payload);
assert.equal(send.payload, payload);
assert.equal(edit.payload.embeds, payload.embeds);
assert.equal(Object.isFrozen(payload), false);
assert.equal(Object.isFrozen(edit), true);
assert.equal(Object.isFrozen(send), true);
console.log('Roadmap mutation Port preserves opaque payload identity');
