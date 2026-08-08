const assert = require('node:assert/strict');
const concierge = require('../../../src/systems/communityConcierge');
const { createGuild, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { fetchFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.includes('guide.message.fetch'), true);
    assert.equal(log.calls.includes('guide.message.send'), true);
    assert.equal(log.calls.includes('onboarding.write'), true);
  });
  console.log('Community guide runtime pair creation failure ordering passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
