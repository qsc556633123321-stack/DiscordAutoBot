const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function writes(log) { return log.calls.filter((call) => !call.endsWith('.read')); }

(async () => {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log) }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.deepEqual(writes(log), ['guide.overwrite.set', 'guide.message.fetch', 'guide.message.edit', 'onboarding.write']);
  });
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log) }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'force' });
    assert.deepEqual(writes(log), ['guide.overwrite.set', 'guide.message.send', 'onboarding.write']);
  });
  console.log('community Guide publication execution call-order baseline passed');
})().catch((error) => { console.error(error); process.exitCode = 1; });
