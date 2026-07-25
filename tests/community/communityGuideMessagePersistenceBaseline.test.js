const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function guildForGuide(log, behavior = {}) {
  const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: {}, label: 'guide' });
  return createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true, ...behavior }, existingGuide: guide });
}

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': { unrelated: { retained: true } } } }, async ({ log, getState }) => {
    await concierge.setupCommunityGuide(guildForGuide(log), { mode: 'create' });
    const record = getState()['guild-1'];
    for (const key of fixture.records.guide) assert.equal(Object.hasOwn(record, key), true, `guide record key: ${key}`);
    assert.deepEqual(record.unrelated, { retained: true });
    assert.equal(log.writes, 1);
  });

  await withOnboardingFile({ raw: '{not json' }, async ({ log, getState }) => {
    await concierge.setupCommunityGuide(guildForGuide(log), { mode: 'create' });
    assert.equal(log.errors.some((line) => line.includes('Read onboarding-flows.json failed')), true);
    assert.equal(getState()['guild-1'].guideChannelId, 'guide-channel');
  });

  await withOnboardingFile({ missingFile: true }, async ({ log, getState }) => {
    await concierge.setupCommunityGuide(guildForGuide(log), { mode: 'create' });
    assert.equal(log.writes, 2, 'missing JSON is initialized, then patched after send');
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
  });

  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log, getState }) => {
    await concierge.setupCommunityGuide(guildForGuide(log), { mode: 'create' });
    assert.equal(log.writes, 1);
    assert.deepEqual(getState(), { 'guild-1': {} }, 'write failure does not roll back the sent Discord message');
  });
  console.log('Community Guide persistence baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
