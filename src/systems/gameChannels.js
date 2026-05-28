const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { resolveGameIdentity } = require('../config/gameAliases');

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

function formatCategoryName(displayName) {
  return `🎮｜${displayName}`;
}

function formatCreateVoiceName(displayName) {
  return `🔊｜➕｜建立${displayName}語音`;
}

function buildGameConfig(game, shortName, options = {}) {
  const identity = resolveGameIdentity(game);
  const displayName = identity.displayName;
  const slug = options.slug || identity.slug;
  const channelPrefix = String(shortName || options.channelPrefix || displayName).trim() || displayName;
  const voiceLabel = options.voiceLabel || displayName;

  return {
    game: displayName,
    displayName,
    slug,
    shortName: channelPrefix,
    categoryName: formatCategoryName(displayName),
    createVoiceName: formatCreateVoiceName(voiceLabel),
    channels: [
      {
        key: 'chat',
        name: `💬｜${channelPrefix}-聊天`,
        type: ChannelType.GuildText,
        aliases: [`${channelPrefix}-聊天`, `${displayName}-聊天`]
      },
      {
        key: 'party',
        name: `🧑‍🤝‍🧑｜${channelPrefix}-找隊友`,
        type: ChannelType.GuildText,
        aliases: [`${channelPrefix}-找隊友`, `${displayName}-找隊友`]
      },
      {
        key: 'info',
        name: `📌｜${channelPrefix}-資訊`,
        type: ChannelType.GuildText,
        aliases: [`${channelPrefix}-資訊`, `${displayName}-資訊`]
      },
      {
        key: 'createVoice',
        name: formatCreateVoiceName(voiceLabel),
        type: ChannelType.GuildVoice,
        aliases: [
          `建立${displayName}語音`,
          `➕｜建立${displayName}語音`,
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
  buildGameConfig('APEX', 'apex', { voiceLabel: 'APEX' }),
  buildGameConfig('特戰英豪', '特戰', { voiceLabel: '特戰' }),
  buildGameConfig('Minecraft', 'mc', { voiceLabel: 'MC' }),
  buildGameConfig('英雄聯盟', 'lol', { voiceLabel: 'LOL' }),
  buildGameConfig('聯盟戰棋', 'tft', { voiceLabel: '聯盟戰棋' })
];

function gameMatchesConfig(config, game, shortName = '') {
  const normalized = normalizeName(game);
  const normalizedShort = normalizeName(shortName);
  return [
    config.game,
    config.displayName,
    config.slug,
    config.shortName,
    config.categoryName,
    config.createVoiceName,
    ...(config.channels || []).flatMap((channel) => [channel.name, ...(channel.aliases || [])])
  ].some((value) => {
    const current = normalizeName(value);
    return current && (current === normalized || current === normalizedShort || normalized.includes(current) || current.includes(normalized));
  });
}

function getGameConfig(game, shortName) {
  const existing = DEFAULT_GAMES.find((item) => gameMatchesConfig(item, game, shortName));
  if (!existing) return buildGameConfig(game, shortName);
  if (!shortName || normalizeName(existing.shortName) === normalizeName(shortName)) return existing;
  return buildGameConfig(existing.displayName, shortName, {
    slug: existing.slug,
    voiceLabel: existing.displayName === 'Minecraft' ? 'MC' : existing.displayName === '英雄聯盟' ? 'LOL' : existing.displayName
  });
}

function findGameConfigByName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => gameMatchesConfig(config, normalized));
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
  const identity = resolveGameIdentity(game);
  const data = readCreateEntryRegistry();
  if (!data[guild.id]) data[guild.id] = {};
  data[guild.id][channel.id] = {
    type: 'create_entry',
    game: identity.displayName,
    displayName: identity.displayName,
    slug: identity.slug,
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
    if (record?.displayName || record?.game) return record.displayName || record.game;
    const parentConfig = findGameConfigByCategoryName(channel.parent?.name);
    if (parentConfig) return parentConfig.displayName;
    if (channel.parent?.name?.startsWith('🎮｜')) return channel.parent.name.replace(/^🎮｜/, '').trim();
  }

  const channelName = channel ? channel.name : String(channelOrName || '');
  const config = findGameConfigByName(channelName);
  if (config) return config.displayName;

  const match = String(channelName || '').match(/建立(.+?)語音/u);
  return match ? match[1].trim() : null;
}

function inferCreateEntryGame(channelOrName) {
  return getGameNameFromCreateVoice(channelOrName);
}

function findCategoryByName(guild, categoryName) {
  const normalized = normalizeName(categoryName);
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && normalizeName(channel.name) === normalized
  );
}

async function findOrCreateGameCategory(guild, game) {
  const config = getGameConfig(game);
  const existing = findCategoryByName(guild, config.categoryName);
  if (existing) return existing;

  return guild.channels.create({
    name: config.categoryName,
    type: ChannelType.GuildCategory,
    reason: 'Game category setup'
  });
}

function findGameCategory(guild, game) {
  const config = getGameConfig(game);
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
    if (category.name !== config.categoryName) await category.setName(config.categoryName, 'Game category canonical name').catch(() => null);
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
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect],
        deny: [PermissionFlagsBits.Speak]
      }
    ];
  }

  return options;
}

async function ensureConfiguredChannel(guild, category, spec, summary, { createMissing }) {
  const existing = findMatchingChannel(guild, spec);
  if (existing) {
    if (existing.name !== spec.name) await existing.setName(spec.name, 'Game channel canonical name').catch(() => null);
    if (existing.parentId !== category.id) {
      await existing.setParent(category.id, {
        lockPermissions: false,
        reason: `Move ${existing.name} back to game category`
      });
      summary.moved.push(existing.name);
    } else {
      summary.existing.push(existing.name);
    }
    if (spec.key === 'createVoice') registerCreateEntryChannel(guild, existing, summary.config.displayName);
    return existing;
  }

  if (!createMissing) {
    summary.missing.push(spec.name);
    return null;
  }

  const channel = await guild.channels.create(buildCreateOptions(guild, category, spec));
  summary.created.push(spec.name);
  if (spec.key === 'createVoice') registerCreateEntryChannel(guild, channel, summary.config.displayName);
  return channel;
}

async function orderGameChannels(channels, summary) {
  for (let index = 0; index < channels.length; index += 1) {
    const channel = channels[index];
    if (!channel) continue;
    try {
      await channel.setPosition(index, { reason: 'Sort game category channels' });
    } catch (error) {
      summary.orderingWarnings.push(`${channel.name}: ${error.message}`);
    }
  }
}

async function setupGameChannels(guild, { game, shortName, createDefaultChannels = true }) {
  const config = getGameConfig(game, shortName);
  const summary = createSummary(config);
  const category = await ensureGameCategory(guild, config, summary);
  const specs = createDefaultChannels ? config.channels : config.channels.filter((spec) => spec.key === 'createVoice');

  const ensuredChannels = [];
  for (const spec of specs) {
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, { createMissing: true });
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
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, { createMissing: false });
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
    const game = inferCreateEntryGame(channel) || record.displayName || record.game;
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
      detail: categoryOk ? `metadata ok (${record.displayName || record.game})` : `category changed; repair recommended (${record.displayName || record.game})`
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
