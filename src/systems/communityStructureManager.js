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

function normalizeName(name = '') {
  return String(name)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u{1f000}-\u{1faff}\u{2600}-\u{27bf}\ufe0f]/gu, '')
    .replace(/[\s｜|\-_/\\:：・•·.,，。()[\]{}<>【】「」『』"'`~!！?？+＋#＃]+/gu, '')
    .trim();
}

function aliasesFor(name, aliases = []) {
  return new Set([name, ...aliases].filter(Boolean).map(normalizeName));
}

function findCategory(guild, name, aliases = []) {
  const names = aliasesFor(name, aliases);
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildCategory &&
    names.has(normalizeName(channel.name))
  )) || null;
}

function findTextChannel(guild, name, aliases = []) {
  const names = aliasesFor(name, aliases);
  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildText &&
    names.has(normalizeName(channel.name))
  )) || null;
}

async function getOrCreateCategory(guild, name, options = {}) {
  const existing = findCategory(guild, name, options.aliases);
  if (existing) {
    if (existing.name !== name) await existing.setName(name, 'Dynamic community category canonical name').catch(() => null);
    return existing;
  }
  return guild.channels.create({
    name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: options.permissionOverwrites,
    reason: options.reason || 'Dynamic community structure setup'
  });
}

async function getOrCreateRole(guild, name, options = {}) {
  const aliases = aliasesFor(name, options.aliases);
  const existing = guild.roles.cache.find((role) => aliases.has(normalizeName(role.name)));
  if (existing) {
    if (existing.name !== name && !existing.managed) await existing.setName(name, 'Dynamic community role canonical name').catch(() => null);
    return existing;
  }
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
    ['站長', '管理員', '👑 站長', '🛡 管理員', '🔧 MOD'].includes(role.name)
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
      const category = await getOrCreateCategory(guild, categoryConfig.name, {
        aliases: categoryConfig.aliases,
        permissionOverwrites: overwrites
      });
      summary.categories.push(category.name);
      if (overwrites) await category.permissionOverwrites.set(overwrites, 'Dynamic community structure permissions').catch(() => null);

      for (const channelConfig of categoryConfig.channels) {
        const aliases = aliasesFor(channelConfig.name, channelConfig.aliases);
        const existing = guild.channels.cache.find(
          (channel) => channel.type === channelConfig.type && aliases.has(normalizeName(channel.name))
        );
        if (existing) {
          if (existing.name !== channelConfig.name) {
            await existing.setName(channelConfig.name, 'Dynamic community channel canonical name').catch(() => null);
          }
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
  const category = await getOrCreateCategory(guild, GAME_CENTER_CATEGORY, {
    aliases: ['遊戲中心', '遊戲大廳']
  });
  let channel = findTextChannel(guild, GAME_SUGGESTION_CHANNEL, ['遊戲提議', '提議遊戲', 'suggest-game']);
  if (!channel) {
    channel = await guild.channels.create({
      name: GAME_SUGGESTION_CHANNEL,
      type: ChannelType.GuildText,
      parent: category.id,
      reason: 'Game suggestion channel setup'
    });
  } else {
    if (channel.name !== GAME_SUGGESTION_CHANNEL) await channel.setName(GAME_SUGGESTION_CHANNEL, 'Game suggestion canonical name').catch(() => null);
    if (channel.parentId !== category.id) {
      await channel.setParent(category.id, { lockPermissions: false, reason: 'Move game suggestion channel to game center' });
    }
  }
  return channel;
}

async function getOrCreateGameArchiveCategory(guild) {
  return getOrCreateCategory(guild, GAME_ARCHIVE_CATEGORY, {
    aliases: ['遊戲封存區', '遊戲封存']
  });
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
