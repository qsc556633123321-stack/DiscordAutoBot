const { ChannelType, PermissionFlagsBits } = require('discord.js');
const {
  COMMUNITY_STRUCTURE,
  GAME_ARCHIVE_CATEGORY,
  GAME_CENTER_CATEGORY,
  GAME_SUGGESTION_CHANNEL,
  NIGHT_CREW_CATEGORY,
  NIGHT_CREW_ROLE
} = require('../config/communityStructure');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findCategory(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildCategory && channel.name === name) || null;
}

function findTextChannel(guild, name) {
  return guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.name === name) || null;
}

async function getOrCreateCategory(guild, name, options = {}) {
  const existing = findCategory(guild, name);
  if (existing) return existing;
  return guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: options.permissionOverwrites,
    reason: options.reason || 'Dynamic community structure setup'
  });
}

async function getOrCreateRole(guild, name, options = {}) {
  const existing = guild.roles.cache.find((role) => role.name === name);
  if (existing) return existing;
  return guild.roles.create({
    name,
    color: options.color || 0x7289da,
    hoist: Boolean(options.hoist),
    mentionable: Boolean(options.mentionable),
    permissions: [],
    reason: options.reason || 'Dynamic community role setup'
  });
}

function buildNightCrewOverwrites(guild, role) {
  return [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.ManageChannels
      ]
    },
    {
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.Connect
      ]
    }
  ];
}

function buildAdminOverwrites(guild) {
  const adminRoles = guild.roles.cache.filter((role) =>
    ['站長', '管理員', '👑 站長', '🛡 管理員'].includes(role.name)
  );
  return [
    { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: guild.members.me.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels
      ]
    },
    ...adminRoles.map((role) => ({
      id: role.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels
      ]
    }))
  ];
}

async function ensureCommunityStructure(guild, options = {}) {
  const summary = { categories: [], channels: [], roles: [], skipped: [], failed: [] };
  const nightCrewRole = await getOrCreateRole(guild, NIGHT_CREW_ROLE, {
    color: 0x5865f2,
    reason: 'Night Crew unlock role'
  }).catch((error) => {
    summary.failed.push(`Night Crew role: ${error.message}`);
    return null;
  });
  if (nightCrewRole) summary.roles.push(nightCrewRole.name);

  for (const categoryConfig of COMMUNITY_STRUCTURE) {
    try {
      let overwrites;
      if (categoryConfig.name === NIGHT_CREW_CATEGORY && nightCrewRole) overwrites = buildNightCrewOverwrites(guild, nightCrewRole);
      if (categoryConfig.permission === 'admin') overwrites = buildAdminOverwrites(guild);
      const category = await getOrCreateCategory(guild, categoryConfig.name, { permissionOverwrites: overwrites });
      summary.categories.push(category.name);
      if (overwrites) await category.permissionOverwrites.set(overwrites, 'Dynamic community structure permissions').catch(() => null);

      for (const channelConfig of categoryConfig.channels) {
        const existing = guild.channels.cache.find(
          (channel) => channel.type === channelConfig.type && channel.name === channelConfig.name
        );
        if (existing) {
          if (existing.parentId !== category.id) {
            await existing.setParent(category.id, { lockPermissions: false, reason: 'Dynamic community structure placement' });
          }
          summary.skipped.push(existing.name);
          continue;
        }
        const created = await guild.channels.create({
          name: channelConfig.name,
          type: channelConfig.type,
          parent: category.id,
          reason: 'Dynamic community structure channel setup'
        });
        summary.channels.push(created.name);
        await sleep(options.delayMs || 500);
      }
    } catch (error) {
      summary.failed.push(`${categoryConfig.name}: ${error.message}`);
    }
  }

  return summary;
}

async function getOrCreateGameSuggestionChannel(guild) {
  const category = await getOrCreateCategory(guild, GAME_CENTER_CATEGORY);
  let channel = findTextChannel(guild, GAME_SUGGESTION_CHANNEL);
  if (!channel) {
    channel = await guild.channels.create({
      name: GAME_SUGGESTION_CHANNEL,
      type: ChannelType.GuildText,
      parent: category.id,
      reason: 'Game suggestion channel setup'
    });
  } else if (channel.parentId !== category.id) {
    await channel.setParent(category.id, { lockPermissions: false, reason: 'Move game suggestion channel to game center' });
  }
  return channel;
}

async function getOrCreateGameArchiveCategory(guild) {
  return getOrCreateCategory(guild, GAME_ARCHIVE_CATEGORY);
}

module.exports = {
  buildAdminOverwrites,
  buildNightCrewOverwrites,
  ensureCommunityStructure,
  findCategory,
  getOrCreateCategory,
  getOrCreateGameArchiveCategory,
  getOrCreateGameSuggestionChannel,
  getOrCreateRole
};
