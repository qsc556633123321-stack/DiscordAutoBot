const assert = require('node:assert/strict');
const fixture = require('../../fixtures/community/community-roadmap-runtime-mutation-consumption-cases.json');
const { createCommunityRoadmapAdapterPairFeature } = require('../../../src/composition/communityRoadmapAdapterPairFeature');

const feature = createCommunityRoadmapAdapterPairFeature();
const channel = { id: 'roadmap', messages: { async fetch() { return null; } }, async send() { return { id: 'S' }; } };
const pair = feature.createAdapterPair({ ensuredChannel: channel });
const { lookupPort, mutationPort, getRetainedMessage } = pair;
assert.equal(fixture.cases.length, 50);
assert.equal(typeof lookupPort.lookupTrackedMessage, 'function');
assert.equal(typeof mutationPort.edit, 'function');
assert.equal(typeof mutationPort.send, 'function');
assert.equal(typeof getRetainedMessage, 'function');
assert.equal('getRetainedMutationFailure' in pair, false);
console.log('Roadmap runtime consumption candidate obtains all capabilities from one Pair without mutation use');
