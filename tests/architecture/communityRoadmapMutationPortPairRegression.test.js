const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

const pair = createRoadmapPublicationAdapterPair({
  ensuredChannel: { id: 'roadmap-channel', messages: { fetch: async () => null }, send: async () => ({ id: 'sent' }) }
});
assert.equal(typeof pair.lookupPort.lookupTrackedMessage, 'function');
assert.equal(typeof pair.getRetainedMessage, 'function');
assert.equal('mutationPort' in pair, false);
console.log('Roadmap Pair remains lookup-only during mutation Port preparation');
