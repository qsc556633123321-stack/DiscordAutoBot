const concierge = require('../../src/systems/communityConcierge');
const {
  createGuild,
  createMessage,
  createTextChannel,
  withOnboardingFile
} = require('./createCommunityGuideMutationHarness');

async function withGuidePublicationExecution(options, run) {
  return withOnboardingFile(options.onboarding || {}, async ({ log, getState }) => {
    const guide = options.guide || createTextChannel({
      id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing',
      log, behavior: options.guideBehavior || {}, label: 'guide'
    });
    const roadmap = options.roadmap || createTextChannel({
      id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing',
      log, behavior: options.roadmapBehavior || {}, label: 'roadmap'
    });
    const guild = createGuild({
      guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
      log, behavior: { categoryExists: true, ...(options.guildBehavior || {}) },
      existingGuide: guide, existingRoadmap: roadmap
    });
    return run({ concierge, guild, guide, roadmap, log, getState, createMessage });
  });
}

module.exports = { withGuidePublicationExecution };
