const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { legacyRoadmapDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

assert.equal(legacyRoadmapDecision(fixture.missingRecord).branch, 'send-new');
assert.equal(legacyRoadmapDecision(fixture.emptyRecord).branch, 'send-new');
assert.equal(legacyRoadmapDecision(fixture.validRecord).branch, 'fetch-existing');
assert.equal(legacyRoadmapDecision(fixture.emptyRoadmapRecord).branch, 'send-new');
assert.equal(legacyRoadmapDecision(fixture.numericRoadmapRecord).branch, 'fetch-existing');
console.log('community Roadmap read pre-integration baseline passed');
