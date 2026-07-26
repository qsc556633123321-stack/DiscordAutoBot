const assert = require('assert');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedDecision, legacyDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');

for (const record of [fixture.missingRecord, fixture.emptyRecord, fixture.validRecord, fixture.nullRecord, fixture.numericGuideRecord, fixture.objectGuideRecord, fixture.emptyGuideRecord]) {
  for (const mode of ['create', 'refresh', 'force']) {
    const legacy = legacyDecision(record, mode);
    const integrated = integratedDecision(fixture.guildId, record, mode);
    assert.deepEqual({ branch: integrated.branch, guideMessageId: integrated.guideMessageId }, legacy, `observable branch differs for ${mode}`);
  }
}
console.log('community publication read runtime differential compatibility passed');
