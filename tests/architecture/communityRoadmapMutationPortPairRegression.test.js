const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

const pair = createRoadmapPublicationAdapterPair({
  ensuredChannel: { id: 'roadmap-channel', messages: { fetch: async () => null }, send: async () => ({ id: 'sent' }) }
});
assert.equal(typeof pair.lookupPort.lookupTrackedMessage, 'function');
assert.equal(typeof pair.getRetainedMessage, 'function');
assert.equal(typeof pair.mutationPort.edit, 'function');
assert.equal(typeof pair.mutationPort.send, 'function');
assert.equal('getRetainedMutationFailure' in pair, false);
console.log('Roadmap Pair exposes the implemented mutation Port without failure getter');
