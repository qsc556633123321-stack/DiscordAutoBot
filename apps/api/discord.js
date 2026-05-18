const { ChannelType, Client, EmbedBuilder, GatewayIntentBits } = require('discord.js');
const {
  createOrganizePlan
} = require('../../src/systems/organizer');

const botClient = new Client({
  intents: [GatewayIntentBits.Guilds]
});

let loginPromise = null;

function ensureBot() {
  if (botClient.isReady()) return Promise.resolve(botClient);
  if (!loginPromise) loginPromise = botClient.login(process.env.DISCORD_TOKEN);
  return loginPromise.then(() => botClient);
}

async function discordFetch(path, accessToken) {
  const response = await fetch(`https://discord.com/api/v10${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!response.ok) throw new Error(`Discord API error ${response.status}`);
  return response.json();
}

function canManageGuild(guild) {
  const permissions = BigInt(guild.permissions || '0');
  const manageGuild = 1n << 5n;
  const administrator = 1n << 3n;
  return (permissions & manageGuild) === manageGuild || (permissions & administrator) === administrator;
}

function iconUrl(guild) {
  return guild.icon
    ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
    : null;
}

async function getManageableGuilds(accessToken) {
  const guilds = await discordFetch('/users/@me/guilds', accessToken);
  const manageable = guilds.filter(canManageGuild);
  const bot = await ensureBot();

  return manageable.map((guild) => ({
    id: guild.id,
    name: guild.name,
    icon: guild.icon,
    iconUrl: iconUrl(guild),
    owner: guild.owner,
    botPresent: bot.guilds.cache.has(guild.id)
  }));
}

function serializeChannel(channel) {
  return {
    id: channel.id,
    name: channel.name,
    type: ChannelType[channel.type] || String(channel.type),
    rawType: channel.type,
    parentId: channel.parentId || null,
    position: channel.rawPosition,
    manageable: channel.manageable ?? false
  };
}

async function getGuild(guildId) {
  const bot = await ensureBot();
  return bot.guilds.fetch(guildId);
}

async function getGuildChannels(guildId) {
  const guild = await getGuild(guildId);
  const channels = await guild.channels.fetch();
  const list = [...channels.values()].filter(Boolean);
  const categories = list
    .filter((channel) => channel.type === ChannelType.GuildCategory)
    .sort((a, b) => a.rawPosition - b.rawPosition)
    .map((category) => ({
      ...serializeChannel(category),
      channels: list
        .filter((channel) => channel.parentId === category.id)
        .sort((a, b) => a.rawPosition - b.rawPosition)
        .map(serializeChannel)
    }));

  const uncategorized = list
    .filter((channel) => !channel.parentId && channel.type !== ChannelType.GuildCategory)
    .sort((a, b) => a.rawPosition - b.rawPosition)
    .map(serializeChannel);

  return { categories, uncategorized };
}

async function getGuildStructure(guildId) {
  const guild = await getGuild(guildId);
  const structure = await getGuildChannels(guildId);
  return {
    id: guild.id,
    name: guild.name,
    memberCount: guild.memberCount,
    ...structure
  };
}

async function getGuildRoles(guildId) {
  const guild = await getGuild(guildId);
  const roles = await guild.roles.fetch();
  return [...roles.values()]
    .filter((role) => role.name !== '@everyone')
    .sort((a, b) => b.position - a.position)
    .map((role) => ({
      id: role.id,
      name: role.name,
      color: role.hexColor,
      position: role.position,
      managed: role.managed,
      editable: role.editable,
      permissions: role.permissions.toArray()
    }));
}

async function sendAnnouncement(guildId, channelId, { title, message }) {
  await getGuild(guildId);
  const channel = await botClient.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Channel is not text based');

  return channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle(title || '公告')
        .setDescription(message || '')
        .setTimestamp()
    ]
  });
}

async function publishPanel(guildId, channelId, draft) {
  await getGuild(guildId);
  const channel = await botClient.channels.fetch(channelId);
  if (!channel || !channel.isTextBased()) throw new Error('Channel is not text based');

  const color = Number.parseInt(String(draft.color || '#5865F2').replace('#', ''), 16) || 0x5865f2;
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(draft.title || 'Discord Community OS')
    .setDescription(draft.content || 'Panel content')
    .setFooter({ text: draft.footer || `Panel type: ${draft.panelType || 'custom'}` })
    .setTimestamp();
  if (draft.image) embed.setImage(draft.image);

  const payload = {
    embeds: [
      embed
    ]
  };

  if (draft.messageId) {
    const existing = await channel.messages.fetch(draft.messageId).catch(() => null);
    if (existing && existing.author.id === botClient.user.id) {
      await existing.edit(payload);
      return existing;
    }
  }

  return channel.send(payload);
}

async function previewAutoOrganize(guildId) {
  const guild = await getGuild(guildId);
  await guild.channels.fetch();
  const source = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText);
  const plan = createOrganizePlan(guild, source?.id || null, 'dashboard');
  return {
    moves: plan.moves.map((item, index) => ({
      index: index + 1,
      channelName: item.channelName,
      currentCategoryName: item.currentCategoryName,
      targetCategoryName: item.targetCategoryName,
      score: item.score,
      confidence: item.confidence,
      reason: item.reason
    })),
    manualReview: plan.manualReview.map((item) => ({
      channelName: item.channelName,
      currentCategoryName: item.currentCategoryName,
      score: item.score,
      confidence: item.confidence,
      reason: item.reason
    })),
    summary: {
      moveCount: plan.moves.length,
      manualReviewCount: plan.manualReview.length
    }
  };
}

async function getBotStatus() {
  const bot = await ensureBot();
  return {
    ready: bot.isReady(),
    tag: bot.user?.tag || null,
    id: bot.user?.id || null,
    guilds: bot.guilds.cache.size,
    uptime: process.uptime(),
    permissions: ['Guilds', 'OAuth2 Dashboard MVP']
  };
}

module.exports = {
  ensureBot,
  getBotStatus,
  getGuildChannels,
  getGuildRoles,
  getGuildStructure,
  getManageableGuilds,
  previewAutoOrganize,
  publishPanel,
  sendAnnouncement
};
