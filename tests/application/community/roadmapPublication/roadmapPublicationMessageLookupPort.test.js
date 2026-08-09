const assert = require('node:assert/strict');
const port = require('../../../../src/application/community/roadmapPublication/RoadmapPublicationMessageLookupPort');

const values = [undefined, null, '', 0, false, 'message-id', ' malformed ', 42, { id: 'object-id' }];
assert.deepEqual(Object.keys(port).sort(), [
  'RoadmapPublicationMessageLookupKind',
  'createRoadmapPublicationMessageAvailable',
  'createRoadmapPublicationMessageLookupRequest',
  'createRoadmapPublicationMessageUnavailable'
].sort());

for (const value of values) {
  const request = port.createRoadmapPublicationMessageLookupRequest({ messageId: value });
  assert.equal(request.messageId, value);
  assert.equal(Object.isFrozen(request), true);
  const available = port.createRoadmapPublicationMessageAvailable(request);
  assert.deepEqual(available, { kind: 'Available', messageId: value });
  assert.equal(available.messageId, value);
  assert.equal(Object.isFrozen(available), true);
}

assert.deepEqual(port.createRoadmapPublicationMessageUnavailable(), { kind: 'Unavailable' });
assert.equal(Object.isFrozen(port.createRoadmapPublicationMessageUnavailable()), true);
assert.equal(port.RoadmapPublicationMessageLookupKind.Available, 'Available');
assert.equal(port.RoadmapPublicationMessageLookupKind.Unavailable, 'Unavailable');
assert.equal(Object.prototype.hasOwnProperty.call(port.RoadmapPublicationMessageLookupKind, 'Failure'), false);
assert.equal(Object.prototype.hasOwnProperty.call(port.createRoadmapPublicationMessageUnavailable(), 'messageId'), false);
console.log('Roadmap publication message lookup port application contract passed');
