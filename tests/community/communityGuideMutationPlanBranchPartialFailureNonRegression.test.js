const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log, { editFails: true }), editFails: true }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await assert.rejects(() => concierge.setupCommunityGuide(guild), /edit failure/);
    assert.equal(log.calls.includes('onboarding.write'), false);
  });
  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 2);
  });
  console.log('community Guide mutation Plan branch partial failure non-regression passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
