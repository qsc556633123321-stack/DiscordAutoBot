const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedRoadmapDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /async function setupRoadmapPanel/);
assert.match(source, /createCommunityPublicationTrackingReadRequest/);
assert.match(source, /createCommunityPublicationTrackingReadCompatibilityAdapter/);
assert.match(source, /publication: 'roadmap'/);
assert.match(source, /trackedMessageId: roadmapMessageId/);
assert.doesNotMatch(source, /publicationState\.roadmap\.messageId \|\| data\.roadmapMessageId/);
for (const [record, branch] of [[fixture.missingRecord, 'send-new'], [fixture.emptyRecord, 'send-new'], [fixture.validRecord, 'fetch-existing'], [fixture.emptyRoadmapRecord, 'send-new'], [fixture.numericRoadmapRecord, 'fetch-existing'], [fixture.objectRoadmapRecord, 'fetch-existing'], [fixture.arrayRoadmapRecord, 'fetch-existing'], [fixture.trueRoadmapRecord, 'fetch-existing']]) {
  assert.equal(integratedRoadmapDecision(fixture.guildId, record).branch, branch);
}
const result = integratedRoadmapDecision(fixture.guildId, fixture.validRecord);
assert.equal(result.state.roadmap.messageId, 'roadmap-message');
assert.equal(result.state.guide.messageId, 'guide-message');
console.log('community Roadmap read runtime integration passed');
