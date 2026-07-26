const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedRoadmapDecision, legacyRoadmapDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

for (const record of [fixture.missingRecord, fixture.emptyRecord, fixture.validRecord, fixture.nullRecord, fixture.emptyRoadmapRecord, fixture.numericRoadmapRecord, fixture.objectRoadmapRecord, fixture.arrayRoadmapRecord, fixture.trueRoadmapRecord]) {
  const legacy = legacyRoadmapDecision(record);
  const integrated = integratedRoadmapDecision(fixture.guildId, record);
  assert.deepEqual({ branch: integrated.branch, roadmapMessageId: integrated.roadmapMessageId }, legacy);
}
console.log('community Roadmap read runtime differential compatibility passed');
