const { ChannelType, PermissionFlagsBits } = require('discord.js');

const DEFAULT_GAMES = [
  {
    game: 'APEX',
    shortName: 'apex',
    categoryName: '🎮｜APEX',
    createVoiceName: '➕｜建立APEX語音',
    textChannels: ['apex-聊天', 'apex-找隊友', 'apex-戰績分享']
  },
  {
    game: '特戰英豪',
    shortName: '特戰',
    categoryName: '🎮｜特戰英豪',
    createVoiceName: '➕｜建立特戰語音',
    textChannels: ['特戰-聊天', '特戰-找隊友', '特戰-戰績分享']
  },
  {
    game: 'Minecraft',
    shortName: 'mc',
    categoryName: '🎮｜Minecraft',
    createVoiceName: '➕｜建立MC語音',
    textChannels: ['mc-聊天', 'mc-伺服器資訊', 'mc-找隊友']
  },
  {
    game: 'LOL',
    shortName: 'lol',
    categoryName: '🎮｜LOL',
    createVoiceName: '➕｜建立LOL語音',
    textChannels: ['lol-聊天', 'lol-找隊友', 'lol-戰績分享']
  }
];

function normalizeName(name) {
  return name.toLowerCase().replace(/[\s_\-｜|#➕🔊🎮]+/g, '');
}

function getGameConfig(game, shortName) {
  const normalizedGame = normalizeName(game);
  const existing = DEFAULT_GAMES.find((item) => (
    normalizeName(item.game) === normalizedGame ||
    normalizeName(item.shortName) === normalizedGame
  ));
  if (existing) return existing;

  return {
    game,
    shortName,
    categoryName: `🎮｜${game}`,
    createVoiceName: `➕｜建立${game}語音`,
    textChannels: [
      `${shortName}-聊天`,
      `${shortName}-找隊友`,
      `${shortName}-戰績分享`
    ]
  };
}

function findGameConfigByName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => (
    normalized.includes(normalizeName(config.game)) ||
    normalized.startsWith(normalizeName(config.shortName))
  ));
}

function isCreateVoiceChannel(channel) {
  return channel &&
    channel.type === ChannelType.GuildVoice &&
    /^➕｜建立.+語音$/.test(channel.name);
}

function getGameNameFromCreateVoice(channelName) {
  const match = channelName.match(/^➕｜建立(.+)語音$/);
  if (!match) return null;
  const label = match[1];
  const config = DEFAULT_GAMES.find((item) => (
    normalizeName(item.createVoiceName) === normalizeName(channelName) ||
    normalizeName(item.game) === normalizeName(label) ||
    normalizeName(item.shortName) === normalizeName(label)
  ));
  return config ? config.game : label;
}

async function findOrCreateGameCategory(guild, game) {
  const config = getGameConfig(game, normalizeName(game));
  const existing = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === config.categoryName
  );
  if (existing) return existing;

  return guild.channels.create({
    name: config.categoryName,
    type: ChannelType.GuildCategory,
    reason: 'Game category setup'
  });
}

function findGameCategory(guild, game) {
  const config = getGameConfig(game, normalizeName(game));
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === config.categoryName
  );
}

async function setupGameChannels(guild, { game, shortName, createDefaultChannels = true }) {
  const config = getGameConfig(game, shortName);
  const created = [];
  let category = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === config.categoryName
  );

  if (!category) {
    category = await guild.channels.create({
      name: config.categoryName,
      type: ChannelType.GuildCategory,
      reason: 'Game category setup'
    });
    created.push(config.categoryName);
  }

  if (createDefaultChannels) {
    for (const channelName of config.textChannels) {
      const existing = guild.channels.cache.find(
        (channel) => channel.type === ChannelType.GuildText && channel.name === channelName
      );
      if (existing) continue;

      await guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category.id,
        reason: 'Game text channel setup'
      });
      created.push(channelName);
    }
  }

  const existingCreateVoice = guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildVoice && channel.name === config.createVoiceName
  );
  if (!existingCreateVoice) {
    await guild.channels.create({
      name: config.createVoiceName,
      type: ChannelType.GuildVoice,
      parent: category.id,
      userLimit: 1,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.Connect
          ],
          deny: [PermissionFlagsBits.Speak]
        }
      ],
      reason: 'Game create-party voice setup'
    });
    created.push(config.createVoiceName);
  }

  return { config, category, created };
}

function inferGameCategoryName(channel) {
  const config = findGameConfigByName(channel.name);
  return config ? config.categoryName : null;
}

module.exports = {
  DEFAULT_GAMES,
  findGameConfigByName,
  findGameCategory,
  findOrCreateGameCategory,
  getGameConfig,
  getGameNameFromCreateVoice,
  inferGameCategoryName,
  isCreateVoiceChannel,
  normalizeName,
  setupGameChannels
};
