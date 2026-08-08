const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { unrelated: { keep: true }, roadmapMessageId: 'roadmap' }, other: { preserve: true } } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.indexOf('guide.message.send') < log.calls.indexOf('onboarding.write'), true);
    assert.equal(getState().other.preserve, true);
    assert.deepEqual(getState()['guild-1'].unrelated, { keep: true });
    assert.equal(getState()['guild-1'].roadmapMessageId, 'roadmap');
  });
  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    const result = await concierge.setupCommunityGuide(guild);
    assert.equal(result.message.id, 'guide-channel-sent');
    assert.equal(getState()['guild-1'].guideMessageId, undefined);
    assert.equal(log.calls.includes('guide.message.send'), true);
    assert.equal(log.errors.length, 1);
  });
  console.log('community Guide publication execution persistence boundary passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
