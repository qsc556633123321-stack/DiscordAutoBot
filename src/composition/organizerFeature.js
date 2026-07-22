const { ChannelType } = require('discord.js');
const { createOrganizerPlanningUseCase } = require('../application/organizer/createOrganizerPlanningUseCase');
const { createMemoryFeature } = require('./memoryFeature');
const { inferGameCategoryName, isCreateVoiceChannel } = require('../systems/gameChannels');
const { isTempVoice } = require('../systems/tempVoice');

function createOrganizerFeature({ channelRuleReader, memoryFeature, logger } = {}) {
  const memory = memoryFeature || createMemoryFeature();
  const reader = channelRuleReader || {
    listByGuild(guildId) {
      return memory.getChannelRulesForOrganizer.execute({ guildId });
    }
  };
  const planner = createOrganizerPlanningUseCase({
    channelRuleReader: reader,
    logger,
    channelTools: {
      categoryType: ChannelType.GuildCategory,
      movableTypes: new Set([
        ChannelType.GuildText,
        ChannelType.GuildVoice,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildStageVoice
      ]),
      voiceTypes: new Set([ChannelType.GuildVoice, ChannelType.GuildStageVoice]),
      inferGameCategoryName,
      isCreateVoiceChannel,
      isTempVoice,
      typeName: (type) => ChannelType[type] || String(type)
    }
  });

  return { ...planner, channelRuleReader: reader };
}

module.exports = { createOrganizerFeature };
