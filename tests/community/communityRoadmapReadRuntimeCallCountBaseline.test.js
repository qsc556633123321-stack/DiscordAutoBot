const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedRoadmapDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');
const existing = integratedRoadmapDecision(fixture.guildId, fixture.validRecord);
const missing = integratedRoadmapDecision(fixture.guildId, fixture.emptyRecord);
assert.equal(existing.branch, 'fetch-existing');
assert.equal(missing.branch, 'send-new');
assert.equal(Object.keys(existing.state).length, 3);
console.log('community Roadmap read runtime call-count baseline passed');
