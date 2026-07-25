const baseline = Object.freeze({
  command: {
    setup: {
      name: 'setup-community-guide',
      descriptionHash: 'b9a7a54d298935a57ca6f970f4cba9d62dcf65f760d1cf81578cc01f5e983f67',
      optionCount: 0,
      permission: 'ManageChannels',
      mode: 'create',
      delegationOrder: ['deferReply', 'setupCommunityGuide', 'setupRoadmapPanel', 'editReply']
    },
    refresh: {
      name: 'refresh-community-guide',
      descriptionHash: 'f940b3257d3b06ba48f028fa69f0deb6b7bbf3ae2fca019b8f8b18a6a47d5c4e',
      optionCount: 0,
      permission: 'ManageChannels',
      mode: 'refresh',
      delegationOrder: ['deferReply', 'setupCommunityGuide', 'setupRoadmapPanel', 'editReply']
    },
    authorizationFailure: {
      defer: { ephemeral: true },
      editReplyContains: 'ManageChannels'
    }
  },
  records: {
    guide: ['guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels', 'updatedAt'],
    roadmap: ['roadmapChannelId', 'roadmapMessageId', 'updatedAt']
  },
  order: {
    existingGuideMessage: ['guide.overwrite.set', 'guide.message.fetch', 'guide.message.edit', 'onboarding.write'],
    newGuideMessage: ['guide.overwrite.set', 'guide.message.send', 'onboarding.write'],
    missingGuideChannel: ['category.create', 'guide.channel.create', 'guide.overwrite.set', 'guide.message.send', 'onboarding.write'],
    roadmapExistingMessage: ['roadmap.message.fetch', 'roadmap.message.edit', 'onboarding.write'],
    roadmapNewMessage: ['roadmap.message.fetch', 'roadmap.message.send', 'onboarding.write']
  },
  dynamicFields: ['messageId', 'channelId', 'updatedAt', 'embedTimestamp'],
  notApplicable: ['guide.channel.setPosition', 'permissionOverwrites.edit', 'concurrentInvocationLock', 'automaticRetryLoop']
});

module.exports = baseline;
