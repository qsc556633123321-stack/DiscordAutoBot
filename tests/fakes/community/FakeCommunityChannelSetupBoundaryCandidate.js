const { ChannelType } = require('discord.js');

function findChannelByName(guild, name, type = ChannelType.GuildText) {
  return guild.channels.cache.find((channel) => channel.type === type && channel.name === name) || null;
}

async function ensureCategory({ guild, name, reason }) {
  let category = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name);
  if (!category) category = await guild.channels.create({ name, type: ChannelType.GuildCategory, reason });
  return category;
}

async function ensureGuideChannel({ guild, categoryName, channelName, overwrites }) {
  const category = await ensureCategory({ guild, name: categoryName, reason: 'Community concierge setup' });
  let channel = findChannelByName(guild, channelName);
  if (!channel) {
    channel = await guild.channels.create({
      name: channelName, type: ChannelType.GuildText, parent: category.id,
      permissionOverwrites: overwrites, reason: 'Community guide setup'
    });
  } else if (channel.parentId !== category.id) {
    await channel.setParent(category.id, { lockPermissions: false, reason: 'Move guide channel to entry category' });
  }
  await channel.permissionOverwrites.set(overwrites, 'Keep guide channel onboarding visible').catch(() => null);
  return channel;
}

async function ensureRoadmapChannel({ guild, categoryName, channelName }) {
  const category = await ensureCategory({ guild, name: categoryName, reason: 'Community concierge setup' });
  const existing = findChannelByName(guild, channelName);
  if (existing) return existing;
  return guild.channels.create({ name: channelName, type: ChannelType.GuildText, parent: category.id, reason: 'Community roadmap setup' });
}

module.exports = { ensureCategory, ensureGuideChannel, ensureRoadmapChannel };
