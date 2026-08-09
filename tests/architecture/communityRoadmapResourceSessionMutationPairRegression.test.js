const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: { id: 'C', messages: { async fetch() { return null; } }, async send() { return { id: 'sent' }; } } });
assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort', 'mutationPort']);
assert.equal(typeof pair.mutationPort.edit, 'function');
assert.equal(typeof pair.mutationPort.send, 'function');
assert.equal('getRetainedMutationFailure' in pair, false);
console.log('Roadmap Pair exposes the implemented Session-backed mutation Port');
