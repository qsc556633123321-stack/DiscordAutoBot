const assert = require('node:assert/strict');
const { createRoadmapPublicationAdapterPair } = require('../../src/infrastructure/community/roadmapPublication/RoadmapPublicationAdapterPairFactory');

const pair = createRoadmapPublicationAdapterPair({
  ensuredChannel: { id: 'channel', messages: { async fetch() { return null; } } }
});
assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort']);
for (const forbidden of ['session', 'resourceSession', 'channel', 'mutationPort', 'lookupTrackedMessage', 'sendMessage', 'editTrackedMessage']) {
  assert.equal(forbidden in pair, false, `${forbidden} must not be public`);
}
console.log('Roadmap production adapter pair surface is narrow');
