const assert = require('node:assert/strict');
const fixtures = require('../../fixtures/community/community-publication-tracking-read-boundary-cases.json');
const { createFakeCommunityPublicationTrackingReadPort } = require('../../fakes/community/FakeCommunityPublicationTrackingReadPort');
const { createFakeCommunityPublicationTrackingReadCompatibilityAdapter } = require('../../fakes/community/FakeCommunityPublicationTrackingReadCompatibilityAdapter');

assert.ok(fixtures.length >= 60, 'Frozen shared tracking fixture inventory must contain at least 60 cases');
for (const fixture of fixtures) {
  let reads = 0;
  const records = fixture.records || { 'guild-1': fixture.record };
  const adapter = createFakeCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData() { reads += 1; return records; } });
  const port = createFakeCommunityPublicationTrackingReadPort({ adapter });
  const result = port.readTrackedMessage({ guildId: 'guild-1', publication: fixture.publication });
  assert.equal(reads, 1, `${fixture.id} must perform exactly one read`);
  assert.deepEqual(Object.keys(result), ['trackedMessageId'], `${fixture.id} must not expose raw state`);
  if (fixture.expectedType) assert.equal(typeof result.trackedMessageId, fixture.expectedType, fixture.id);
  else if (fixture.expectedObject) assert.deepEqual(result.trackedMessageId, fixture.record[`${fixture.publication}MessageId`], fixture.id);
  else if (fixture.expectedArray) assert.deepEqual(result.trackedMessageId, fixture.record[`${fixture.publication}MessageId`], fixture.id);
  else assert.strictEqual(result.trackedMessageId, fixture.expected, fixture.id);
}
for (const publication of ['unknown', '', null, undefined]) {
  const adapter = createFakeCommunityPublicationTrackingReadCompatibilityAdapter({ readOnboardingData() { return {}; } });
  const port = createFakeCommunityPublicationTrackingReadPort({ adapter });
  assert.throws(() => port.readTrackedMessage({ guildId: 'guild-1', publication }), /Unsupported publication/);
}
console.log('Shared publication tracking read candidate freezes narrow semantics, exact IDs, validation, and one-read behavior.');
