const { ChannelType, PermissionFlagsBits } = require('discord.js');

function normalizeName(name) {
  return String(name || '')
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function formatCategoryName(game) {
  return `🎮｜${game}`;
}

function formatCreateVoiceName(game) {
  return `➕｜建立${game}語音`;
}

function buildGameConfig(game, shortName, options = {}) {
  const cleanGame = String(game || '').trim();
  const cleanShortName = String(shortName || cleanGame).trim();
  const voiceLabel = options.voiceLabel || cleanGame;
  const clipsLabel = options.clipsLabel || '戰績分享';
  const infoLabel = options.infoLabel || '資訊';

  return {
    game: cleanGame,
    shortName: cleanShortName,
    categoryName: formatCategoryName(cleanGame),
    createVoiceName: formatCreateVoiceName(voiceLabel),
    channels: [
      {
        key: 'chat',
        name: `💬｜${cleanShortName}-聊天`,
        type: ChannelType.GuildText,
        aliases: [`${cleanShortName}-聊天`]
      },
      {
        key: 'party',
        name: `🧑‍🤝‍🧑｜${cleanShortName}-找隊友`,
        type: ChannelType.GuildText,
        aliases: [`${cleanShortName}-找隊友`]
      },
      {
        key: 'clips',
        name: `🏆｜${cleanShortName}-${clipsLabel}`,
        type: ChannelType.GuildText,
        aliases: [`${cleanShortName}-${clipsLabel}`, ...(options.clipAliases || [])]
      },
      {
        key: 'info',
        name: `📌｜${cleanShortName}-${infoLabel}`,
        type: ChannelType.GuildText,
        aliases: [`${cleanShortName}-${infoLabel}`, ...(options.infoAliases || [])]
      },
      {
        key: 'createVoice',
        name: formatCreateVoiceName(voiceLabel),
        type: ChannelType.GuildVoice,
        aliases: [
          `建立${cleanGame}語音`,
          `➕｜建立${cleanGame}語音`,
          `建立${voiceLabel}語音`,
          `➕｜建立${voiceLabel}語音`
        ],
        userLimit: 1
      }
    ]
  };
}

const DEFAULT_GAMES = [
  buildGameConfig('APEX', 'apex'),
  buildGameConfig('特戰英豪', '特戰', { voiceLabel: '特戰' }),
  buildGameConfig('Minecraft', 'mc', {
    voiceLabel: 'MC',
    clipsLabel: '建築分享',
    infoLabel: '伺服器資訊',
    clipAliases: ['mc-戰績分享', '🏆｜mc-戰績分享'],
    infoAliases: ['mc-資訊', '📌｜mc-資訊']
  }),
  buildGameConfig('LOL', 'lol')
];

function getGameConfig(game, shortName) {
  const normalizedGame = normalizeName(game);
  const normalizedShortName = normalizeName(shortName);
  const existing = DEFAULT_GAMES.find((item) => (
    normalizeName(item.game) === normalizedGame ||
    normalizeName(item.shortName) === normalizedGame ||
    normalizeName(item.shortName) === normalizedShortName
  ));

  if (!existing) return buildGameConfig(game, shortName);
  if (!shortName || normalizeName(existing.shortName) === normalizedShortName) return existing;

  return buildGameConfig(existing.game, shortName);
}

function findGameConfigByName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => (
    normalized.includes(normalizeName(config.game)) ||
    normalized.startsWith(normalizeName(config.shortName))
  ));
}

function isCreateVoiceChannel(channel) {
  return Boolean(
    channel &&
    channel.type === ChannelType.GuildVoice &&
    /^➕?｜?建立.+語音$/u.test(channel.name)
  );
}

function getGameNameFromCreateVoice(channelName) {
  const match = String(channelName || '').match(/^➕?｜?建立(.+)語音$/u);
  if (!match) return null;

  const label = match[1];
  const config = DEFAULT_GAMES.find((item) => (
    normalizeName(item.game) === normalizeName(label) ||
    normalizeName(item.shortName) === normalizeName(label) ||
    normalizeName(item.createVoiceName) === normalizeName(channelName)
  ));

  return config ? config.game : label;
}

function findCategoryByName(guild, categoryName) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName
  );
}

async function findOrCreateGameCategory(guild, game) {
  const config = getGameConfig(game, normalizeName(game));
  const existing = findCategoryByName(guild, config.categoryName);
  if (existing) return existing;

  return guild.channels.create({
    name: config.categoryName,
    type: ChannelType.GuildCategory,
    reason: 'Game category setup'
  });
}

function findGameCategory(guild, game) {
  const config = getGameConfig(game, normalizeName(game));
  return findCategoryByName(guild, config.categoryName);
}

function getChannelAliases(spec) {
  return [spec.name, ...(spec.aliases || [])].filter(Boolean);
}

function findMatchingChannel(guild, spec) {
  const aliases = getChannelAliases(spec);
  return guild.channels.cache.find((channel) => (
    channel.type === spec.type &&
    aliases.some((alias) => channel.name === alias || normalizeName(channel.name) === normalizeName(alias))
  ));
}

function createSummary(config) {
  return {
    config,
    category: null,
    created: [],
    existing: [],
    moved: [],
    missing: [],
    orderingWarnings: []
  };
}

async function ensureGameCategory(guild, config, summary) {
  let category = findCategoryByName(guild, config.categoryName);

  if (!category) {
    category = await guild.channels.create({
      name: config.categoryName,
      type: ChannelType.GuildCategory,
      reason: 'Game category setup'
    });
    summary.created.push(config.categoryName);
  } else {
    summary.existing.push(config.categoryName);
  }

  summary.category = category;
  return category;
}

function buildCreateOptions(guild, category, spec) {
  const options = {
    name: spec.name,
    type: spec.type,
    parent: category.id,
    reason: 'Game channel setup'
  };

  if (spec.type === ChannelType.GuildVoice) {
    options.userLimit = spec.userLimit || 1;
    options.permissionOverwrites = [
      {
        id: guild.roles.everyone.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.Connect
        ],
        deny: [PermissionFlagsBits.Speak]
      }
    ];
  }

  return options;
}

async function ensureConfiguredChannel(guild, category, spec, summary, { createMissing }) {
  const existing = findMatchingChannel(guild, spec);

  if (existing) {
    if (existing.parentId !== category.id) {
      await existing.setParent(category.id, {
        lockPermissions: false,
        reason: `Move ${existing.name} back to game category`
      });
      summary.moved.push(existing.name);
    } else {
      summary.existing.push(existing.name);
    }

    return existing;
  }

  if (!createMissing) {
    summary.missing.push(spec.name);
    return null;
  }

  const channel = await guild.channels.create(buildCreateOptions(guild, category, spec));
  summary.created.push(spec.name);
  return channel;
}

async function orderGameChannels(channels, summary) {
  for (let index = 0; index < channels.length; index += 1) {
    const channel = channels[index];
    if (!channel) continue;

    try {
      await channel.setPosition(index, {
        reason: 'Sort game category channels'
      });
    } catch (error) {
      summary.orderingWarnings.push(`${channel.name}: ${error.message}`);
    }
  }
}

async function setupGameChannels(guild, { game, shortName, createDefaultChannels = true }) {
  const config = getGameConfig(game, shortName);
  const summary = createSummary(config);
  const category = await ensureGameCategory(guild, config, summary);
  const specs = createDefaultChannels
    ? config.channels
    : config.channels.filter((spec) => spec.key === 'createVoice');

  const ensuredChannels = [];
  for (const spec of specs) {
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, {
      createMissing: true
    });
    ensuredChannels.push(channel);
  }

  await orderGameChannels(ensuredChannels, summary);
  return summary;
}

async function fixGameCategory(guild, { game, shortName }) {
  const config = getGameConfig(game, shortName);
  const summary = createSummary(config);
  const category = await ensureGameCategory(guild, config, summary);
  const ensuredChannels = [];

  for (const spec of config.channels) {
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, {
      createMissing: false
    });
    ensuredChannels.push(channel);
  }

  await orderGameChannels(ensuredChannels, summary);
  return summary;
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
  fixGameCategory,
  getGameConfig,
  getGameNameFromCreateVoice,
  inferGameCategoryName,
  isCreateVoiceChannel,
  normalizeName,
  setupGameChannels
};
