const assert = require('node:assert/strict');
const { createFakeRoadmapPublicationAdapterPair } = require('../fakes/community/FakeRoadmapPublicationAdapterPair');

const pair = createFakeRoadmapPublicationAdapterPair({
  ensuredChannel: { id: 'channel', messages: { async fetch() { return null; } } }
});
assert.deepEqual(Object.keys(pair).sort(), ['getRetainedMessage', 'lookupPort']);
for (const forbidden of ['session', 'resourceSession', 'channel', 'mutationPort', 'lookupTrackedMessage']) {
  assert.equal(forbidden in pair, false, `${forbidden} must remain private`);
}
console.log('Roadmap adapter pair candidate surface is narrow');
