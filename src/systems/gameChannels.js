const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const {
  findGameIdentity,
  getGameId,
  isSameGame,
  resolveGameIdentity,
  stripGameCategoryPrefix
} = require('./gameIdentityService');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CREATE_ENTRY_FILE = path.join(DATA_DIR, 'temp-voice-create-entries.json');
const GAME_CATEGORY_FILE = path.join(DATA_DIR, 'game-categories.json');
const pendingGameRegistryDoctorPlans = new Map();
const GAME_REGISTRY_DOCTOR_TTL_MS = 15 * 60 * 1000;

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

function ensureJsonFile(filePath) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '{}\n', 'utf8');
}

function readJsonFile(filePath) {
  ensureJsonFile(filePath);
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`[GameChannels] read failed ${path.basename(filePath)}:`, error);
    return {};
  }
}

function writeJsonFile(filePath, data) {
  ensureJsonFile(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function readGameCategoryMetadata() {
  return readJsonFile(GAME_CATEGORY_FILE);
}

function writeGameCategoryMetadata(data) {
  writeJsonFile(GAME_CATEGORY_FILE, data);
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
  const gameId = options.gameId || identity.gameId || identity.id;
  const slug = options.slug || identity.slug || gameId.replace(/_/g, '-');
  const voiceLabel = options.voiceLabel || displayName;

  return {
    game: displayName,
    gameId,
    displayName,
    emoji: identity.emoji || '🎮',
    slug,
    shortName: String(shortName || slug).trim() || slug,
    categoryName: formatCategoryName(displayName),
    createVoiceName: formatCreateVoiceName(''),
    channels: [
      {
        key: 'chat',
        name: '💬｜聊天',
        type: ChannelType.GuildText,
        aliases: [`${displayName}-聊天`, `${shortName || slug}-聊天`, '聊天']
      },
      {
        key: 'party',
        name: '🧑‍🤝‍🧑｜找隊友',
        type: ChannelType.GuildText,
        aliases: [`${displayName}-找隊友`, `${shortName || slug}-找隊友`, '找隊友']
      },
      {
        key: 'info',
        name: '📌｜資訊',
        type: ChannelType.GuildText,
        aliases: [`${displayName}-資訊`, `${shortName || slug}-資訊`, '資訊']
      },
      {
        key: 'createVoice',
        name: formatCreateVoiceName(''),
        type: ChannelType.GuildVoice,
        aliases: [
          `建立${displayName}語音`,
          `➕｜建立${displayName}語音`,
          `建立${voiceLabel}語音`,
          `➕｜建立${voiceLabel}語音`,
          `🔊｜➕｜建立${voiceLabel}語音`,
          '建立語音',
          '➕｜建立語音',
          '🔊｜➕｜建立語音'
        ],
        userLimit: 1
      }
    ]
  };
}

const DEFAULT_GAMES = [
  buildGameConfig('APEX', 'apex'),
  buildGameConfig('VALORANT', 'valorant'),
  buildGameConfig('Minecraft', 'mc'),
  buildGameConfig('英雄聯盟', 'lol'),
  buildGameConfig('聯盟戰棋', 'tft'),
  buildGameConfig('鬥陣特攻2', 'ow2'),
  buildGameConfig('GTFO', 'gtfo')
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
  const exact = DEFAULT_GAMES.find((item) => normalizeName(item.displayName) === normalizeName(game));
  if (exact && !shortName) return exact;

  const aliasMatch = DEFAULT_GAMES.find((item) => gameMatchesConfig(item, game, shortName));
  const slug = aliasMatch?.slug || resolveGameIdentity(game).slug;
  return buildGameConfig(game, shortName, {
    slug,
    voiceLabel: game
  });
}

function findGameConfigByName(name) {
  const normalized = normalizeName(name);
  return DEFAULT_GAMES.find((config) => gameMatchesConfig(config, normalized));
}

function findGameConfigByCategoryName(name) {
  if (!name) return null;
  return getGameConfig(stripGameCategoryPrefix(name));
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
    gameId: identity.gameId || identity.id,
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

function upsertDynamicGameMetadata(guild, category, config, channels = {}, createdBy = null) {
  if (!guild || !category || !config) return null;
  const data = readGameCategoryMetadata();
  if (!data[guild.id]) data[guild.id] = {};
  const existing = data[guild.id][category.id] || {};
  const channelIds = {
    chat: channels.chat?.id || existing.channels?.chat || null,
    lfg: channels.party?.id || channels.lfg?.id || existing.channels?.lfg || null,
    info: channels.info?.id || existing.channels?.info || null,
    voiceCreate: channels.createVoice?.id || channels.voiceCreate?.id || existing.channels?.voiceCreate || null
  };
  data[guild.id][category.id] = {
    guildId: guild.id,
    categoryId: category.id,
    gameId: config.gameId || getGameId(config.displayName),
    displayName: config.displayName,
    slug: config.slug,
    type: 'dynamic_game',
    createdBy: existing.createdBy || createdBy || null,
    createdAt: existing.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    channels: channelIds
  };
  writeGameCategoryMetadata(data);
  return data[guild.id][category.id];
}

function getDynamicGameMetadata(guildId, categoryId) {
  return readGameCategoryMetadata()[guildId]?.[categoryId] || null;
}

function findDynamicGameMetadataByChannel(guild, channel) {
  if (!guild || !channel) return null;
  const data = readGameCategoryMetadata()[guild.id] || {};
  const categoryId = channel.type === ChannelType.GuildCategory ? channel.id : channel.parentId;
  if (categoryId && data[categoryId]?.type === 'dynamic_game') return data[categoryId];
  return Object.values(data).find((record) => (
    record?.type === 'dynamic_game' &&
    Object.values(record.channels || {}).includes(channel.id)
  )) || null;
}

function repairDynamicGameMetadataForCategory(guild, category, createdBy = null) {
  if (!guild || !category || category.type !== ChannelType.GuildCategory || !category.name.startsWith('🎮｜')) return null;
  const displayName = category.name.replace(/^🎮｜/, '').trim();
  const config = getGameConfig(displayName);
  const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
  const channelMap = {};
  for (const child of children.values()) {
    if (/聊天/.test(child.name)) channelMap.chat = child;
    else if (/找隊友|lfg/i.test(child.name)) channelMap.lfg = child;
    else if (/資訊|info/i.test(child.name)) channelMap.info = child;
    else if (child.type === ChannelType.GuildVoice && /建立.*語音/u.test(child.name)) channelMap.voiceCreate = child;
  }
  if (channelMap.voiceCreate) registerCreateEntryChannel(guild, channelMap.voiceCreate, config.displayName);
  return upsertDynamicGameMetadata(guild, category, config, channelMap, createdBy);
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

function getCategoryDisplayName(category) {
  return stripGameCategoryPrefix(category?.name || '');
}

function findGameCategoryByIdentity(guild, game) {
  const identity = findGameIdentity(game);
  const metadata = readGameCategoryMetadata()[guild.id] || {};
  const metadataMatch = Object.values(metadata).find((record) => (
    record?.type === 'dynamic_game' &&
    (record.gameId === identity.id || record.id === identity.id || isSameGame(record.displayName, identity.displayName))
  ));
  if (metadataMatch?.categoryId) {
    const category = guild.channels.cache.get(metadataMatch.categoryId);
    if (category?.type === ChannelType.GuildCategory) return category;
  }

  return guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildCategory &&
    channel.name.startsWith('🎮｜') &&
    isSameGame(getCategoryDisplayName(channel), identity.displayName)
  )) || null;
}

async function findOrCreateGameCategory(guild, game) {
  const config = getGameConfig(game);
  const existing = findGameCategoryByIdentity(guild, config.displayName) || findCategoryByName(guild, config.categoryName);
  if (existing) return existing;

  return guild.channels.create({
    name: config.categoryName,
    type: ChannelType.GuildCategory,
    reason: 'Game category setup'
  });
}

function findGameCategory(guild, game) {
  const config = getGameConfig(game);
  return findGameCategoryByIdentity(guild, config.displayName) || findCategoryByName(guild, config.categoryName);
}

function getChannelAliases(spec) {
  return [spec.name, ...(spec.aliases || [])].filter(Boolean);
}

function findMatchingChannel(guild, spec, category = null) {
  const aliases = getChannelAliases(spec);
  const inCategory = guild.channels.cache.find((channel) => (
    channel.type === spec.type &&
    (!category || channel.parentId === category.id) &&
    aliases.some((alias) => channel.name === alias || normalizeName(channel.name) === normalizeName(alias))
  ));
  if (inCategory) return inCategory;

  const globalAliases = aliases.filter((alias) => /-|建立.+語音/.test(alias));
  return guild.channels.cache.find((channel) => (
    channel.type === spec.type &&
    globalAliases.some((alias) => channel.name === alias || normalizeName(channel.name) === normalizeName(alias))
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
  let category = findGameCategoryByIdentity(guild, config.displayName) || findCategoryByName(guild, config.categoryName);
  if (!category) {
    category = await guild.channels.create({
      name: config.categoryName,
      type: ChannelType.GuildCategory,
      reason: 'Game category setup'
    });
    summary.created.push(config.categoryName);
  } else {
    summary.existing.push(config.categoryName);
    summary.existingCategoryId = category.id;
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
  const existing = findMatchingChannel(guild, spec, category);
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
  const channelMap = {};
  for (const spec of specs) {
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, { createMissing: true });
    ensuredChannels.push(channel);
    if (channel) channelMap[spec.key === 'party' ? 'lfg' : spec.key] = channel;
  }

  await orderGameChannels(ensuredChannels, summary);
  upsertDynamicGameMetadata(guild, category, config, channelMap, null);
  return summary;
}

async function fixGameCategory(guild, { game, shortName }) {
  const config = getGameConfig(game, shortName);
  const summary = createSummary(config);
  const category = await ensureGameCategory(guild, config, summary);
  const ensuredChannels = [];
  const channelMap = {};

  for (const spec of config.channels) {
    const channel = await ensureConfiguredChannel(guild, category, spec, summary, { createMissing: false });
    ensuredChannels.push(channel);
    if (channel) channelMap[spec.key === 'party' ? 'lfg' : spec.key] = channel;
  }

  await orderGameChannels(ensuredChannels, summary);
  upsertDynamicGameMetadata(guild, category, config, channelMap, null);
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

function buildGameRegistryDoctorPlan(guild, requestedById = null) {
  const metadata = readGameCategoryMetadata()[guild.id] || {};
  const categories = guild.channels.cache
    .filter((channel) => channel.type === ChannelType.GuildCategory && channel.name.startsWith('🎮｜'))
    .filter((channel) => !/遊戲中心|遊戲大廳/.test(channel.name));
  const actions = [];
  const groups = new Map();

  for (const category of categories.values()) {
    const displayName = getCategoryDisplayName(category);
    const identity = findGameIdentity(displayName);
    const key = identity.id;
    if (!groups.has(key)) groups.set(key, []);
    const record = metadata[category.id];
    const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
    const score = (record?.type === 'dynamic_game' ? 100 : 0) +
      (displayName === identity.displayName ? 50 : 0) +
      children.size;
    groups.get(key).push({ category, displayName, identity, record, children, score });

    if (!record || record.type !== 'dynamic_game' || record.gameId !== identity.id) {
      actions.push({
        type: 'repair_metadata',
        categoryId: category.id,
        categoryName: category.name,
        gameId: identity.id,
        displayName: identity.displayName,
        reason: '缺少或不一致的 dynamic_game metadata'
      });
    }

    const expected = {
      chat: '💬｜聊天',
      lfg: '🧑‍🤝‍🧑｜找隊友',
      info: '📌｜資訊',
      voiceCreate: '🔊｜➕｜建立語音'
    };
    const found = {};
    for (const child of children.values()) {
      if (/聊天/.test(child.name)) found.chat = found.chat || child;
      else if (/找隊友|lfg/i.test(child.name)) found.lfg = found.lfg || child;
      else if (/資訊|info/i.test(child.name)) found.info = found.info || child;
      else if (child.type === ChannelType.GuildVoice && /建立.*語音/u.test(child.name)) found.voiceCreate = found.voiceCreate || child;
    }

    for (const [keyName, expectedName] of Object.entries(expected)) {
      const child = found[keyName];
      if (!child) continue;
      if (child.name !== expectedName) {
        actions.push({
          type: 'rename_child',
          channelId: child.id,
          channelName: child.name,
          newName: expectedName,
          categoryId: category.id,
          categoryName: category.name,
          gameId: identity.id,
          displayName: identity.displayName,
          reason: 'Community Schema v2 統一遊戲子頻道命名'
        });
      }
      if (keyName === 'voiceCreate' && !getCreateEntryRecord(guild.id, child.id)) {
        actions.push({
          type: 'repair_create_entry',
          channelId: child.id,
          channelName: child.name,
          categoryId: category.id,
          categoryName: category.name,
          gameId: identity.id,
          displayName: identity.displayName,
          reason: 'create entry 未註冊'
        });
      }
    }
  }

  for (const group of groups.values()) {
    if (group.length <= 1) continue;
    const sorted = [...group].sort((a, b) => b.score - a.score);
    const keep = sorted[0];
    for (const duplicate of sorted.slice(1)) {
      actions.push({
        type: 'archive_duplicate_category',
        categoryId: duplicate.category.id,
        categoryName: duplicate.category.name,
        keepCategoryId: keep.category.id,
        keepCategoryName: keep.category.name,
        gameId: keep.identity.id,
        displayName: keep.identity.displayName,
        reason: `語意重複遊戲分類，保留 ${keep.category.name}`
      });
    }
  }

  const plan = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    requestedById,
    createdAt: Date.now(),
    actions
  };
  pendingGameRegistryDoctorPlans.set(plan.id, plan);
  setTimeout(() => pendingGameRegistryDoctorPlans.delete(plan.id), GAME_REGISTRY_DOCTOR_TTL_MS);
  return plan;
}

function getGameRegistryDoctorPlan(id) {
  return pendingGameRegistryDoctorPlans.get(id) || null;
}

function deleteGameRegistryDoctorPlan(id) {
  pendingGameRegistryDoctorPlans.delete(id);
}

async function findOrCreateOldArchiveCategory(guild) {
  let archive = guild.channels.cache.find((channel) => (
    channel.type === ChannelType.GuildCategory &&
    /舊頻道封存|封存區|archive/i.test(channel.name)
  ));
  if (archive) return archive;
  archive = await guild.channels.create({
    name: '📦｜舊頻道封存',
    type: ChannelType.GuildCategory,
    reason: 'Game registry doctor archive setup'
  });
  return archive;
}

async function executeGameRegistryDoctorPlan(guild, plan) {
  const summary = { metadata: [], renamed: [], createEntries: [], archived: [], skipped: [], failed: [] };
  for (const item of plan.actions) {
    try {
      if (item.type === 'repair_metadata') {
        const category = guild.channels.cache.get(item.categoryId);
        if (!category) {
          summary.skipped.push(`${item.categoryName}: 分類不存在`);
          continue;
        }
        const record = repairDynamicGameMetadataForCategory(guild, category, plan.requestedById);
        summary.metadata.push(`${category.name}: ${record?.gameId || item.gameId}`);
      } else if (item.type === 'rename_child') {
        const channel = guild.channels.cache.get(item.channelId);
        if (!channel) {
          summary.skipped.push(`${item.channelName}: 頻道不存在`);
          continue;
        }
        if (channel.name !== item.newName) await channel.setName(item.newName, 'Game Registry Doctor rename child');
        summary.renamed.push(`${item.channelName} -> ${item.newName}`);
      } else if (item.type === 'repair_create_entry') {
        const channel = guild.channels.cache.get(item.channelId);
        if (!channel) {
          summary.skipped.push(`${item.channelName}: 頻道不存在`);
          continue;
        }
        registerCreateEntryChannel(guild, channel, item.displayName);
        summary.createEntries.push(channel.name);
      } else if (item.type === 'archive_duplicate_category') {
        const category = guild.channels.cache.get(item.categoryId);
        if (!category) {
          summary.skipped.push(`${item.categoryName}: 分類不存在`);
          continue;
        }
        const archive = await findOrCreateOldArchiveCategory(guild);
        const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
        for (const child of children.values()) {
          await child.setParent(archive.id, { lockPermissions: false, reason: 'Archive duplicate game category child' });
        }
        summary.archived.push(`${item.categoryName} -> ${archive.name}`);
      }
    } catch (error) {
      summary.failed.push(`${item.categoryName || item.channelName}: ${error.message}`);
    }
  }
  return summary;
}

module.exports = {
  DEFAULT_GAMES,
  buildGameRegistryDoctorPlan,
  deleteGameRegistryDoctorPlan,
  diagnoseCreateEntries,
  executeGameRegistryDoctorPlan,
  findGameConfigByName,
  findGameCategory,
  findGameCategoryByIdentity,
  findOrCreateGameCategory,
  fixGameCategory,
  findDynamicGameMetadataByChannel,
  getCreateEntryRecord,
  getGameConfig,
  getDynamicGameMetadata,
  getGameRegistryDoctorPlan,
  getGameNameFromCreateVoice,
  inferCreateEntryGame,
  inferGameCategoryName,
  isCreateVoiceChannel,
  normalizeName,
  readCreateEntryRegistry,
  readGameCategoryMetadata,
  repairDynamicGameMetadataForCategory,
  registerCreateEntryChannel,
  removeCreateEntryRecord,
  repairCreateEntryRegistry,
  repairCreateEntryRegistryForClient,
  setupGameChannels,
  upsertDynamicGameMetadata
};
