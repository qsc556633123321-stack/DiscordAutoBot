const { ChannelType } = require('discord.js');

function findChannelByName(guild, name, type = ChannelType.GuildText) {
  return guild.channels.cache.find((channel) => channel.type === type && channel.name === name) || null;
}

function createCommunityChannelSetupCompatibilityAdapter({ guild, onboardingVisible } = {}) {
  async function ensureCategory({ name }) {
    let category = guild.channels.cache.find(
      (channel) => channel.type === ChannelType.GuildCategory && channel.name === name
    );

    if (!category) {
      category = await guild.channels.create({
        name,
        type: ChannelType.GuildCategory,
        reason: 'Community concierge setup'
      });
    }

    return category;
  }

  async function ensureGuideChannel({ categoryName, channelName }) {
    const category = await ensureCategory({ name: categoryName });
    let channel = findChannelByName(guild, channelName);

    if (!channel) {
      channel = await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: onboardingVisible(guild),
        reason: 'Community guide setup'
      });
    } else if (channel.parentId !== category.id) {
      await channel.setParent(category.id, {
        lockPermissions: false,
        reason: 'Move guide channel to entry category'
      });
    }

    await channel.permissionOverwrites
      .set(onboardingVisible(guild), 'Keep guide channel onboarding visible')
      .catch(() => null);

    return channel;
  }

  async function ensureRoadmapChannel({ categoryName, channelName }) {
    const category = await ensureCategory({ name: categoryName });
    const existing = findChannelByName(guild, channelName);

    if (existing) return existing;

    return guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: category.id,
      reason: 'Community roadmap setup'
    });
  }

  return Object.freeze({
    ensureCategory,
    ensureGuideChannel,
    ensureRoadmapChannel
  });
}

module.exports = { createCommunityChannelSetupCompatibilityAdapter };
