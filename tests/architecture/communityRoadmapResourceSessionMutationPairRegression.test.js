const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

const pair = createRoadmapPublicationAdapterPair({ ensuredChannel: { id: 'C', messages: { async fetch() { return null; } } } });
assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort']);
assert.equal('mutationPort' in pair, false);
console.log('Roadmap Pair remains lookup-only during Session mutation preparation');
