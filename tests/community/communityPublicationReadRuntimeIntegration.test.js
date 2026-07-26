const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /fromLegacyPublicationRecord/);
assert.match(source, /const publicationState = fromLegacyPublicationRecord\(guild\.id, data\)/);
assert.match(source, /publicationState\.guide\.messageId \|\| data\.guideMessageId/);
for (const [record, branch] of [[fixture.missingRecord, 'send-new'], [fixture.emptyRecord, 'send-new'], [fixture.validRecord, 'fetch-existing'], [fixture.emptyGuideRecord, 'send-new'], [fixture.numericGuideRecord, 'fetch-existing'], [fixture.objectGuideRecord, 'fetch-existing']]) {
  assert.equal(integratedDecision(fixture.guildId, record).branch, branch);
}
const result = integratedDecision(fixture.guildId, fixture.validRecord);
assert.equal(result.state.guide.messageId, 'guide-message');
assert.equal(result.state.roadmap.messageId, 'roadmap-message');
console.log('community publication read runtime integration passed');
