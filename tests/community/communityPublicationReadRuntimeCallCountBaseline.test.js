const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

const existing = integratedDecision(fixture.guildId, fixture.validRecord);
const missing = integratedDecision(fixture.guildId, fixture.emptyRecord);
assert.equal(existing.branch, 'fetch-existing');
assert.equal(missing.branch, 'send-new');
assert.equal(existing.state.guildId, fixture.guildId);
assert.equal(missing.state.guildId, fixture.guildId);
// Mapper invocation adds no filesystem, Discord, persistence, or serialization call.
assert.equal(Object.keys(existing.state).length, 3);
console.log('community publication read runtime call-count baseline passed');
