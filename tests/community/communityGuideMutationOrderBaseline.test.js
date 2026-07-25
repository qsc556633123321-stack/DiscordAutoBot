const assert = require('node:assert/strict');
const concierge = require('../../src/systems/communityConcierge');
const fixture = require('../fixtures/communityGuideMutationLegacyBaseline');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../helpers/createCommunityGuideMutationHarness');

function mutations(log) { return log.calls.filter((call) => !call.endsWith('.read')); }

async function main() {
  await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'tracked' } } }, async ({ log }) => {
    const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log) }, label: 'guide' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
    await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
    assert.deepEqual(mutations(log), fixture.order.existingGuideMessage);
  });

  await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: {} });
    await concierge.setupCommunityGuide(guild);
    assert.deepEqual(mutations(log), fixture.order.missingGuideChannel);
  });

  await withOnboardingFile({ initial: { 'guild-1': { roadmapMessageId: 'tracked' } } }, async ({ log }) => {
    const roadmap = createTextChannel({ id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { existingMessage: createMessage('tracked', log, {}, 'roadmap') }, label: 'roadmap' });
    const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingRoadmap: roadmap });
    await concierge.setupRoadmapPanel(guild);
    assert.deepEqual(mutations(log), fixture.order.roadmapExistingMessage);
  });
  console.log('Community Guide mutation-order baseline tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
