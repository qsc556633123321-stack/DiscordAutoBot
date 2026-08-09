const assert = require('node:assert/strict');
const cases = require('../../fixtures/community/community-guide-read-boundary-cases.json');
const { createFakeProductionShapeGuideTrackedStateRead } = require('../../fakes/community/FakeProductionShapeGuideTrackedStateRead');

assert.ok(cases.length >= 50, 'Frozen fixture inventory must contain at least 50 cases');
for (const fixture of cases) {
  let reads = 0;
  const records = fixture.records || { 'guild-1': fixture.record };
  const candidate = createFakeProductionShapeGuideTrackedStateRead({ readOnboardingData() { reads += 1; return records; } });
  const result = candidate.getTrackedPublicationMessageId({ guildId: 'guild-1', publication: fixture.publication });
  assert.equal(reads, 1, `${fixture.id} must use one read`);
  if (fixture.expectedType) assert.equal(typeof result, fixture.expectedType, fixture.id);
  else if (fixture.expectedObject) assert.deepEqual(result, fixture.record.guideMessageId, fixture.id);
  else assert.strictEqual(result, fixture.expected, fixture.id);
}

assert.throws(() => createFakeProductionShapeGuideTrackedStateRead({ readOnboardingData() { return {}; } }).getTrackedPublicationMessageId({ guildId: 'guild-1', publication: 'unknown' }), /Unsupported publication/);
console.log('Guide tracked state read candidate preserves frozen legacy ID values with one read and no duplicate mapper.');
