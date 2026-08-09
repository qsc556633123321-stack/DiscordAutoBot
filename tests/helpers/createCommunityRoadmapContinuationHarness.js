const concierge = require('../../src/systems/communityConcierge');
const {
  createGuild,
  createMessage,
  createTextChannel,
  withOnboardingFile
} = require('./createCommunityGuideMutationHarness');

function createRoadmapChannel(log, behavior = {}) {
  return createTextChannel({
    id: 'roadmap-channel',
    name: concierge.ROADMAP_CHANNEL_NAME,
    parentId: 'category-existing',
    log,
    behavior,
    label: 'roadmap'
  });
}

function createRoadmapGuild(log, roadmap, behavior = {}) {
  return createGuild({
    guideName: concierge.GUIDE_CHANNEL_NAME,
    roadmapName: concierge.ROADMAP_CHANNEL_NAME,
    log,
    behavior: { categoryExists: true, ...behavior },
    existingRoadmap: roadmap
  });
}

module.exports = {
  concierge,
  createGuild: createRoadmapGuild,
  createMessage,
  createRoadmapChannel,
  withOnboardingFile
};
