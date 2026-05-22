const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const LOG_CHANNEL_NAMES = ['server-logs', '📑｜server-logs'];
const ADMIN_CATEGORY_NAMES = ['🔒｜管理員後台', '管理員後台'];

function findTextChannelByNames(guild, names) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildText && names.includes(channel.name)
  ) || null;
}

function findAdminCategory(guild) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && ADMIN_CATEGORY_NAMES.includes(channel.name)
  ) || null;
}

async function getOrCreateServerLogChannel(guild) {
  let channel = findTextChannelByNames(guild, LOG_CHANNEL_NAMES);
  if (channel) return channel;

  const botMember = guild.members.me;
  if (!botMember?.permissions.has(PermissionFlagsBits.ManageChannels)) return null;
  const adminRoles = ['站長', '管理員']
    .map((name) => guild.roles.cache.find((role) => role.name === name))
    .filter(Boolean);
  const adminRoleOverwrites = adminRoles.map((role) => ({
    id: role.id,
    allow: [
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory
    ]
  }));

  let adminCategory = findAdminCategory(guild);
  if (!adminCategory) {
    adminCategory = await guild.channels.create({
      name: '🔒｜管理員後台',
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: [PermissionFlagsBits.ViewChannel] },
        {
          id: botMember.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels
          ]
        },
        ...adminRoleOverwrites
      ],
      reason: 'Create admin backend for server logs'
    });
  }

  channel = await guild.channels.create({
    name: '📑｜server-logs',
    type: ChannelType.GuildText,
    parent: adminCategory.id,
    reason: 'Create server logs channel'
  });

  return channel;
}

async function writeServerLog(guild, options) {
  if (!guild) return false;

  try {
    const channel = await getOrCreateServerLogChannel(guild);
    if (!channel?.isTextBased()) return false;

    const embed = new EmbedBuilder()
      .setColor(options.color ?? 0x5865f2)
      .setTitle(options.title || '系統紀錄')
      .setDescription(options.description || '已完成一項操作。')
      .setTimestamp();

    if (options.fields?.length) {
      embed.addFields(options.fields.slice(0, 25));
    }

    await channel.send({ embeds: [embed] });
    return true;
  } catch (error) {
    console.error('server log failed:', error);
    return false;
  }
}

module.exports = {
  getOrCreateServerLogChannel,
  writeServerLog
};
