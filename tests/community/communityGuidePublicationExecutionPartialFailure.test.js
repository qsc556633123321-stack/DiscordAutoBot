const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log, getState }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log) }, label: 'guide' });
    const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { sendFails: true }, label: 'roadmap' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide, existingRoadmap: roadmap });
    await concierge.setupCommunityGuide(guild);
    await assert.rejects(() => concierge.setupRoadmapPanel(guild), /roadmap send failure/);
    assert.equal(getState()['guild-1'].guideMessageId, 'tracked');
  });
  await withOnboardingFile({ initial: { 'guild-1': {} }, writeFails: true }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild);
    await concierge.setupCommunityGuide(guild);
    assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 2, 'unpersisted send can be duplicated');
  });
  console.log('community Guide publication execution partial failure passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
