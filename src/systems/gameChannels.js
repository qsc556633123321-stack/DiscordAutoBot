const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CREATE_ENTRY_FILE = path.join(DATA_DIR, 'temp-voice-create-entries.json');

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(CREATE_ENTRY_FILE)) fs.writeFileSync(CREATE_ENTRY_FILE, '{}\n', 'utf8');
}

function readCreateEntryRegistry() {
  ensureDataFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(CREATE_ENTRY_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('[TempVoice Debug] create entry registry read failed:', error);
    return {};
  }
}

function writeCreateEntryRegistry(data) {
  ensureDataFile();
  try {
    fs.writeFileSync(CREATE_ENTRY_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('[TempVoice Debug] create entry registry write failed:', error);
  }
}

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
          `➕｜建立${voiceLabel}語音`,
          `🔊｜➕｜建立${voiceLabel}語音`
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
    clipAliases: ['mc-建築分享', '🏗｜mc-建築分享'],
    infoAliases: ['mc-資訊', '📌｜mc-伺服器資訊']
  }),
  buildGameConfig('LOL', 'lol'),
  buildGameConfig('英雄聯盟', 'lol', { voiceLabel: 'LOL' }),
  buildGameConfig('聯盟戰棋', 'tft', { voiceLabel: '聯盟戰棋' })
];

function getGameConfig(game, shortName) {
  const normalizedGame = normalizeName(game);
  const normalizedShortName = normalizeName(shortName);
  const existing = DEFAULT_GAMES.find((item) => (
    normalizeName(item.game) === normalizedGame ||
    normalizeName(item.shortName) === normalizedGame ||
    normalizeName(item.shortName) === normalizedShortName ||
    normalizeName(item.createVoiceName).includes(normalizedGame)
  ));

  if (!existing) return buildGameConfig(game, shortName);
  if (!shortName || normalizeName(existing.shortName) === normalizedShortName) return existing;

  return buildGameConfig(existing.game, shortName, {
    voiceLabel: existing.game === 'Minecraft' ? 'MC' : existing.game === '特戰英豪' ? '特戰' : existing.game
  });
}

function findGameConfigByName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => (
    normalized.includes(normalizeName(config.game)) ||
    normalized.startsWith(normalizeName(config.shortName)) ||
    normalized.includes(normalizeName(config.shortName))
  ));
}

function findGameConfigByCategoryName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => normalizeName(config.categoryName) === normalized);
}

function looksLikeCreateVoiceName(name) {
  const normalized = normalizeName(name);
  return normalized.includes(normalizeName('建立')) && normalized.includes(normalizeName('語音'));
}

function getCreateEntryRecord(guildId, channelId) {
  return readCreateEntryRegistry()[guildId]?.[channelId] || null;
}

function removeCreateEntryRecord(guildId, channelId) {
  const data = readCreateEntryRegistry();
  if (!data[guildId]?.[channelId]) return false;
  delete data[guildId][channelId];
  if (Object.keys(data[guildId]).length === 0) delete data[guildId];
  writeCreateEntryRegistry(data);
  return true;
}

function registerCreateEntryChannel(guild, channel, game) {
  if (!guild || !channel || channel.type !== ChannelType.GuildVoice || !game) return null;
  const data = readCreateEntryRegistry();
  if (!data[guild.id]) data[guild.id] = {};
  data[guild.id][channel.id] = {
    type: 'create_entry',
    game,
    channelId: channel.id,
    channelName: channel.name,
    categoryId: channel.parentId || null,
    categoryName: channel.parent?.name || null,
    updatedAt: new Date().toISOString()
  };
  writeCreateEntryRegistry(data);
  return data[guild.id][channel.id];
}

function isCreateVoiceChannel(channel) {
  if (!channel || channel.type !== ChannelType.GuildVoice) return false;
  if (getCreateEntryRecord(channel.guild.id, channel.id)?.type === 'create_entry') return true;
  return looksLikeCreateVoiceName(channel.name);
}

function getGameNameFromCreateVoice(channelOrName) {
  const channel = typeof channelOrName === 'object' ? channelOrName : null;
  if (channel) {
    const record = getCreateEntryRecord(channel.guild.id, channel.id);
    if (record?.game) return record.game;
    const parentConfig = findGameConfigByCategoryName(channel.parent?.name);
    if (parentConfig) return parentConfig.game;
  }

  const channelName = channel ? channel.name : String(channelOrName || '');
  const config = findGameConfigByName(channelName);
  if (config) return config.game;

  const raw = String(channelName || '').replace(/^[^\p{Letter}\p{Number}]*建立/u, '建立');
  const match = raw.match(/建立(.+?)語音/u);
  if (!match) return null;
  return match[1].trim();
}

function inferCreateEntryGame(channelOrName) {
  const channel = typeof channelOrName === 'object' ? channelOrName : null;
  if (channel) {
    const parentConfig = findGameConfigByCategoryName(channel.parent?.name);
    if (parentConfig) return parentConfig.game;
  }

  const channelName = channel ? channel.name : String(channelOrName || '');
  const config = findGameConfigByName(channelName);
  if (config) return config.game;

  const raw = String(channelName || '').replace(/^[^\p{Letter}\p{Number}]*建立/u, '建立');
  const match = raw.match(/建立(.+?)語音/u);
  return match ? match[1].trim() : null;
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

    if (spec.key === 'createVoice') registerCreateEntryChannel(guild, existing, summary.config.game);
    return existing;
  }

  if (!createMissing) {
    summary.missing.push(spec.name);
    return null;
  }

  const channel = await guild.channels.create(buildCreateOptions(guild, category, spec));
  summary.created.push(spec.name);
  if (spec.key === 'createVoice') registerCreateEntryChannel(guild, channel, summary.config.game);
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

function isCreateEntryName(channel) {
  return channel?.type === ChannelType.GuildVoice && looksLikeCreateVoiceName(channel.name);
}

async function repairCreateEntryRegistry(guild) {
  const data = readCreateEntryRegistry();
  const guildRecords = data[guild.id] || {};
  const repaired = [];
  const removed = [];
  const healthy = [];

  for (const [channelId, record] of Object.entries(guildRecords)) {
    const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      removeCreateEntryRecord(guild.id, channelId);
      removed.push(record.channelName || channelId);
      continue;
    }
    const game = inferCreateEntryGame(channel) || record.game;
    registerCreateEntryChannel(guild, channel, game);
    healthy.push(channel.name);
  }

  const createEntries = guild.channels.cache.filter((channel) => isCreateEntryName(channel));
  for (const channel of createEntries.values()) {
    if (getCreateEntryRecord(guild.id, channel.id)) continue;
    const game = inferCreateEntryGame(channel);
    if (!game) continue;
    registerCreateEntryChannel(guild, channel, game);
    repaired.push(channel.name);
  }

  return { repaired, removed, healthy };
}

async function repairCreateEntryRegistryForClient(client) {
  const summaries = [];
  for (const guild of client.guilds.cache.values()) {
    summaries.push({ guildId: guild.id, guildName: guild.name, ...(await repairCreateEntryRegistry(guild)) });
  }
  return summaries;
}

async function diagnoseCreateEntries(guild) {
  const data = readCreateEntryRegistry();
  const records = data[guild.id] || {};
  const lines = [];
  const seen = new Set();

  for (const [channelId, record] of Object.entries(records)) {
    const channel = guild.channels.cache.get(channelId) || await guild.channels.fetch(channelId).catch(() => null);
    seen.add(channelId);
    if (!channel) {
      lines.push({ status: '❌', channelName: record.channelName || channelId, detail: 'metadata points to a missing channel' });
      continue;
    }
    if (channel.type !== ChannelType.GuildVoice) {
      lines.push({ status: '❌', channelName: channel.name, detail: 'metadata channel is not a voice channel' });
      continue;
    }
    const categoryOk = !record.categoryId || record.categoryId === channel.parentId;
    lines.push({
      status: categoryOk ? '✅' : '⚠️',
      channelName: channel.name,
      detail: categoryOk ? `metadata ok (${record.game})` : `category changed; repair recommended (${record.game})`
    });
  }

  for (const channel of guild.channels.cache.filter((item) => isCreateEntryName(item)).values()) {
    if (seen.has(channel.id)) continue;
    lines.push({ status: '⚠️', channelName: channel.name, detail: 'missing metadata but name looks like a create entry' });
  }

  return lines;
}

module.exports = {
  DEFAULT_GAMES,
  diagnoseCreateEntries,
  findGameConfigByName,
  findGameCategory,
  findOrCreateGameCategory,
  fixGameCategory,
  getCreateEntryRecord,
  getGameConfig,
  getGameNameFromCreateVoice,
  inferCreateEntryGame,
  inferGameCategoryName,
  isCreateVoiceChannel,
  normalizeName,
  readCreateEntryRegistry,
  registerCreateEntryChannel,
  removeCreateEntryRecord,
  repairCreateEntryRegistry,
  repairCreateEntryRegistryForClient,
  setupGameChannels
};
