const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { other: { keep: true }, 'guild-1': { roadmapMessageId: 'roadmap', native: 'keep' } } }, async ({ getState, log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    assert.equal(getState().other.keep, true);
    assert.equal(getState()['guild-1'].roadmapMessageId, 'roadmap');
    assert.equal(getState()['guild-1'].native, 'keep');
    assert.equal(getState()['guild-1'].guideMessageId, 'guide-channel-sent');
  });
  console.log('community Guide mutation Plan branch persistence non-regression passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
