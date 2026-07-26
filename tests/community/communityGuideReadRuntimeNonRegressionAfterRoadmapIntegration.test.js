const assert = require('assert');
const fs = require('fs');
const path = require('path');
const fixture = require('../fixtures/communityPublicationReadRuntimeIntegrationFixture');
const { integratedDecision, legacyDecision } = require('../helpers/createCommunityPublicationReadRuntimeHarness');
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'src/systems/communityConcierge.js'), 'utf8');
assert.match(source, /publicationState\.guide\.messageId \|\| data\.guideMessageId/);
for (const record of [fixture.missingRecord, fixture.validRecord, fixture.numericGuideRecord, fixture.objectGuideRecord]) {
  const integrated = integratedDecision(fixture.guildId, record);
  assert.deepEqual({ branch: integrated.branch, guideMessageId: integrated.guideMessageId }, legacyDecision(record));
}
console.log('community Guide read non-regression after Roadmap integration passed');
