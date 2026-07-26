const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { legacyDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

assert.equal(legacyDecision(fixture.missingRecord).branch, 'send-new');
assert.equal(legacyDecision(fixture.emptyRecord).branch, 'send-new');
assert.equal(legacyDecision(fixture.validRecord).branch, 'fetch-existing');
assert.equal(legacyDecision(fixture.emptyGuideRecord).branch, 'send-new');
assert.equal(legacyDecision(fixture.numericGuideRecord).branch, 'fetch-existing');
assert.equal(legacyDecision(fixture.validRecord, 'force').branch, 'send-new');
console.log('community publication read pre-integration baseline passed');
