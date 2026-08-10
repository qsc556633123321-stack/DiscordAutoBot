const assert = require('node:assert/strict');
const fixtures = require('../../fixtures/community/community-tracking-read-runtime-redirect-cases.json');
const { fromLegacyPublicationRecord } = require('../../../src/application/community/communityPublicationStateMapper');
const { createFakeCommunityGuideTrackingReadRuntimeRedirect } = require('../../fakes/community/FakeCommunityGuideTrackingReadRuntimeRedirect');

function rawValue(kind) {
  const values = {
    valid: 'guide-message', 'valid-alt': 'guide-message-alt', empty: '', null: null,
    false: false, zero: 0, number: 123, 'number-alt': 456, true: true,
    object: {}, 'object-alt': { id: 'raw' }, array: [], 'array-alt': ['raw'],
    whitespace: '   ', lookup: 'lookup-id', send: undefined, 'force-send': 'force-id',
    ordering: 'ordering-id', 'single-read': 'single-read-id', 'read-count': 'count-id',
    'no-runtime-raw': 'raw-id', 'missing-guild': undefined, 'reader-failure': undefined
  };
  return values[kind];
}

function legacyTrackedMessageId(guildId, data) {
  const state = fromLegacyPublicationRecord(guildId, data);
  return state.guide.messageId || data.guideMessageId;
}

async function runCase(fixture) {
  const value = rawValue(fixture.kind);
  const data = value === undefined ? {} : { guideMessageId: value };
  const records = fixture.kind === 'missing-guild' || fixture.kind === 'reader-failure' ? {} : { 'guild-guide': data };
  const expected = legacyTrackedMessageId('guild-guide', records['guild-guide'] || {});
  let reads = 0;
  const candidate = createFakeCommunityGuideTrackingReadRuntimeRedirect({
    readOnboardingData() { reads += 1; return records; }
  });
  const events = [];
  const result = await candidate.execute({
    guildId: 'guild-guide',
    mode: fixture.kind === 'force-send' ? 'force' : undefined,
    lookup(id) { events.push(`lookup:${String(id)}`); },
    mutate(input) { events.push(`mutation:${input.lookupAttempted}`); },
    persist() { events.push('persistence'); }
  });
  assert.strictEqual(result.trackedMessageId, expected, fixture.id);
  assert.equal(result.lookupAttempted, Boolean(expected) && fixture.kind !== 'force-send', fixture.id);
  assert.equal(reads, 1, `${fixture.id} must read once`);
  assert.equal(events.at(-1), 'persistence', `${fixture.id} must persist after mutation`);
}

(async () => {
  const cases = fixtures.filter((fixture) => fixture.publication === 'guide');
  assert.ok(cases.length >= 30, 'Guide fixture coverage must remain frozen');
  for (const fixture of cases) await runCase(fixture);
  console.log('Guide tracking-read redirect candidate preserves legacy values, lookup decisions, failure fallback, and one-read behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
