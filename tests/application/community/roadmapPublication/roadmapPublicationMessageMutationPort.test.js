const assert = require('node:assert/strict');
const port = require('../../../../src/application/community/roadmapPublication/RoadmapPublicationMessageMutationPort');

const values = [undefined, null, '', 0, false, 'message-id', ' malformed ', 42, { id: 'object-id' }];
assert.deepEqual(Object.keys(port).sort(), [
  'RoadmapPublicationMessageMutationKind',
  'assertRoadmapPublicationMessageMutationPort',
  'createRoadmapPublicationMessageEditRequest',
  'createRoadmapPublicationMessageEditSuccess',
  'createRoadmapPublicationMessageSendRequest',
  'createRoadmapPublicationMessageSendSuccess'
].sort());

for (const value of values) {
  const payload = { value };
  const edit = port.createRoadmapPublicationMessageEditRequest({ messageId: value, payload });
  const send = port.createRoadmapPublicationMessageSendRequest({ payload });
  assert.deepEqual(edit, { messageId: value, payload });
  assert.deepEqual(send, { payload });
  assert.equal(edit.messageId, value);
  assert.equal(edit.payload, payload);
  assert.equal(send.payload, payload);
  assert.equal(Object.isFrozen(edit), true);
  assert.equal(Object.isFrozen(send), true);
  assert.deepEqual(port.createRoadmapPublicationMessageEditSuccess({ messageId: value }), { kind: 'EditSuccess', messageId: value });
  assert.deepEqual(port.createRoadmapPublicationMessageSendSuccess({ messageId: value }), { kind: 'SendSuccess', messageId: value });
}

assert.equal(port.RoadmapPublicationMessageMutationKind.EditSuccess, 'EditSuccess');
assert.equal(port.RoadmapPublicationMessageMutationKind.SendSuccess, 'SendSuccess');
assert.doesNotThrow(() => port.assertRoadmapPublicationMessageMutationPort({ edit() {}, send() {} }));
assert.throws(() => port.assertRoadmapPublicationMessageMutationPort({ edit() {} }), /edit and send/);
assert.throws(() => port.assertRoadmapPublicationMessageMutationPort({ send() {} }), /edit and send/);
console.log('Roadmap publication message mutation Application Port contract passed');
