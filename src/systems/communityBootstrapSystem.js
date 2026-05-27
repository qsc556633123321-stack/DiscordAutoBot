const fs = require('node:fs');
const path = require('node:path');
const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits
} = require('discord.js');
const { COMMUNITY_LAYOUT, PUBLIC_ONBOARDING_CHANNELS, REQUIRED_ROLES } = require('../config/communityLayout');
const permissionTemplates = require('../config/permissionTemplates');
const { registerCreateEntryChannel, isCreateVoiceChannel, removeCreateEntryRecord } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');
const { setupCommunityGuide } = require('./communityConcierge');
const { writeServerLog } = require('./serverLogs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REGISTRY_FILE = path.join(DATA_DIR, 'community-layout-registry.json');
const STEP_DELAY_MS = 700;
const pendingDedupePlans = new Map();

function wait(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureRegistryFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REGISTRY_FILE)) fs.writeFileSync(REGISTRY_FILE, '{}\n', 'utf8');
}

function readRegistry() {
  ensureRegistryFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(REGISTRY_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error('[CommunityLayout] registry read failed:', error);
    return {};
  }
}

function writeRegistry(data) {
  ensureRegistryFile();
  try {
    fs.writeFileSync(REGISTRY_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error('[CommunityLayout] registry write failed:', error);
  }
}

function baseNormalize(name = '') {
  return String(name)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u{1f000}-\u{1faff}\u{2600}-\u{27bf}\ufe0f]/gu, '')
    .replace(/[\s｜|\-_/\\:：・•·.,，。()[\]{}<>【】「」『』"'`~!！?？+＋#＃]+/gu, '')
    .trim();
}

function collectNames(config) {
  return [config.key, config.name, ...(config.aliases || [])].filter(Boolean);
}

const aliasToCanonical = new Map();
for (const category of COMMUNITY_LAYOUT) {
  for (const name of collectNames(category)) aliasToCanonical.set(baseNormalize(name), category.key);
  for (const channel of category.channels || []) {
    for (const name of collectNames(channel)) aliasToCanonical.set(baseNormalize(name), channel.key);
  }
}

function normalizeChannelName(name = '') {
  const normalized = baseNormalize(name);
  return aliasToCanonical.get(normalized) || normalized;
}

function sameChannelType(channel, expectedType) {
  if (!channel) return false;
  if (expectedType === ChannelType.GuildText) return channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement;
  return channel.type === expectedType;
}

function updateRegistry(guildId, key, channel, meta = {}) {
  if (!channel) return;
  const registry = readRegistry();
  if (!registry[guildId]) registry[guildId] = {};
  registry[guildId][key] = {
    id: channel.id,
    type: channel.type === ChannelType.GuildCategory ? 'category' : 'channel',
    parentKey: meta.parentKey || null,
    lastSeenName: channel.name,
    updatedAt: new Date().toISOString()
  };
  writeRegistry(registry);
}

function getRegistryRecord(guildId, key) {
  return readRegistry()[guildId]?.[key] || null;
}

function findByRegistry(guild, key, expectedType) {
  const record = getRegistryRecord(guild.id, key);
  if (!record?.id) return null;
  const channel = guild.channels.cache.get(record.id);
  if (!sameChannelType(channel, expectedType)) return null;
  return channel;
}

function findByAliases(guild, config, expectedType) {
  const aliases = new Set(collectNames(config).map(normalizeChannelName));
  return guild.channels.cache.find((channel) => (
    sameChannelType(channel, expectedType) &&
    aliases.has(normalizeChannelName(channel.name))
  )) || null;
}

function findLayoutCategory(key) {
  return COMMUNITY_LAYOUT.find((item) => item.key === key) || null;
}

function findLayoutChannel(key) {
  for (const category of COMMUNITY_LAYOUT) {
    const channel = category.channels.find((item) => item.key === key);
    if (channel) return { category, channel };
  }
  return null;
}

function getTemplateOverwrites(guild, layoutItem) {
  if (layoutItem.permission === 'publicEntry') return permissionTemplates.publicEntry(guild);
  if (layoutItem.permission === 'semiPublic') return permissionTemplates.semiPublic(guild);
  if (layoutItem.permission === 'roleRestricted') return permissionTemplates.roleRestricted(guild, layoutItem.roleName);
  if (layoutItem.permission === 'nightCrew') return permissionTemplates.nightCrew(guild);
  if (layoutItem.permission === 'adminOnly') return permissionTemplates.adminOnly(guild);
  return permissionTemplates.publicEntry(guild);
}

function createSummary(mode = 'execute') {
  return {
    mode,
    createdRoles: [],
    existingRoles: [],
    createdCategories: [],
    existingCategories: [],
    createdChannels: [],
    existingChannels: [],
    moved: [],
    renamed: [],
    repairedCategories: [],
    repairedChannels: [],
    metadataRegistered: [],
    duplicates: [],
    warnings: [],
    failed: [],
    skipped: []
  };
}

function roleAliases(roleConfig) {
  return new Set([roleConfig.name, ...(roleConfig.aliases || [])].map(baseNormalize));
}

function findRole(guild, roleConfig) {
  const aliases = roleAliases(roleConfig);
  return guild.roles.cache.find((role) => aliases.has(baseNormalize(role.name))) || null;
}

async function ensureRoles(guild, summary, options = {}) {
  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    summary.warnings.push('Bot 缺少 ManageRoles，已略過角色建立。');
    return;
  }

  for (const roleConfig of REQUIRED_ROLES) {
    let role = findRole(guild, roleConfig);
    if (!role) {
      if (options.preview) {
        summary.createdRoles.push(roleConfig.name);
        continue;
      }
      try {
        role = await guild.roles.create({
          name: roleConfig.name,
          color: roleConfig.color,
          permissions: [],
          mentionable: false,
          reason: 'Community layout role setup'
        });
        summary.createdRoles.push(role.name);
        await wait();
      } catch (error) {
        summary.failed.push(`建立角色 ${roleConfig.name}: ${error.message}`);
      }
      continue;
    }

    summary.existingRoles.push(role.name);
    if (role.name !== roleConfig.name && !role.managed) {
      if (options.preview) {
        summary.renamed.push(`${role.name} -> ${roleConfig.name}`);
      } else {
        try {
          await role.setName(roleConfig.name, 'Community layout role canonical name');
          summary.renamed.push(`${role.name} -> ${roleConfig.name}`);
          await wait();
        } catch (error) {
          summary.failed.push(`角色改名 ${role.name}: ${error.message}`);
        }
      }
    }
  }
}

async function ensureCategory(guild, layoutItem, summary, options = {}) {
  let category = findByRegistry(guild, layoutItem.key, ChannelType.GuildCategory) ||
    findByAliases(guild, layoutItem, ChannelType.GuildCategory);

  if (!category) {
    if (options.preview) {
      summary.createdCategories.push(layoutItem.name);
      return null;
    }
    try {
      category = await guild.channels.create({
        name: layoutItem.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: getTemplateOverwrites(guild, layoutItem),
        reason: 'Community layout category setup'
      });
      summary.createdCategories.push(category.name);
      updateRegistry(guild.id, layoutItem.key, category);
      await wait();
    } catch (error) {
      summary.failed.push(`建立分類 ${layoutItem.name}: ${error.message}`);
      return null;
    }
  } else {
    summary.existingCategories.push(category.name);
    updateRegistry(guild.id, layoutItem.key, category);
  }

  if (category && category.name !== layoutItem.name) {
    if (options.preview) {
      summary.renamed.push(`${category.name} -> ${layoutItem.name}`);
    } else {
      try {
        const oldName = category.name;
        await category.setName(layoutItem.name, 'Community layout canonical category name');
        summary.renamed.push(`${oldName} -> ${layoutItem.name}`);
        updateRegistry(guild.id, layoutItem.key, category);
        await wait();
      } catch (error) {
        summary.failed.push(`分類改名 ${category.name}: ${error.message}`);
      }
    }
  }

  if (category && options.applyPermissions !== false) {
    if (options.preview) {
      summary.repairedCategories.push(category.name);
    } else {
      await category.permissionOverwrites.set(getTemplateOverwrites(guild, layoutItem), 'Community layout permission repair')
        .then(() => summary.repairedCategories.push(category.name))
        .catch((error) => summary.failed.push(`分類權限 ${category.name}: ${error.message}`));
      await wait();
    }
  }

  if (category && options.order) {
    const targetPosition = COMMUNITY_LAYOUT.findIndex((item) => item.key === layoutItem.key);
    if (category.rawPosition !== targetPosition) {
      if (options.preview) {
        summary.moved.push(`${category.name} -> 分類排序 ${targetPosition + 1}`);
      } else {
        await category.setPosition(targetPosition, { reason: 'Community layout category ordering' }).catch((error) => {
          summary.failed.push(`分類排序 ${category.name}: ${error.message}`);
        });
        await wait();
      }
    }
  }

  return category;
}

function protectReason(channel) {
  if (!channel) return '不存在';
  if (channel.name.startsWith('ticket-')) return 'ticket 私人頻道';
  if (channel.name.startsWith('server-logs') || channel.name.includes('server-logs')) return 'server-logs';
  if (channel.name.startsWith('ticket-logs') || channel.name.includes('ticket-logs')) return 'ticket-logs';
  if (channel.name.includes('bot-control')) return 'bot-control';
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return 'active temp voice';
  const protectedKeys = new Set([
    'lfg_recruit',
    'game_suggestions',
    'voice_hub',
    'late_night_chat',
    'general_chat',
    'party_lobby'
  ]);
  const layout = findLayoutChannel(normalizeChannelName(channel.name));
  if (layout && protectedKeys.has(layout.channel.key)) return '核心有效頻道';
  return null;
}

async function ensureChannel(guild, layoutItem, category, spec, index, summary, options = {}) {
  let channel = findByRegistry(guild, spec.key, spec.type) || findByAliases(guild, spec, spec.type);

  if (!channel) {
    if (options.preview) {
      summary.createdChannels.push(`${layoutItem.name} / ${spec.name}`);
      return null;
    }
    try {
      channel = await guild.channels.create({
        name: spec.name,
        type: spec.type,
        parent: category?.id,
        userLimit: spec.userLimit,
        reason: 'Community layout channel setup'
      });
      summary.createdChannels.push(channel.name);
      updateRegistry(guild.id, spec.key, channel, { parentKey: layoutItem.key });
      await wait();
    } catch (error) {
      summary.failed.push(`建立頻道 ${spec.name}: ${error.message}`);
      return null;
    }
  } else {
    summary.existingChannels.push(channel.name);
    updateRegistry(guild.id, spec.key, channel, { parentKey: layoutItem.key });
  }

  if (!channel) return null;

  if (channel.name !== spec.name) {
    if (options.preview) {
      summary.renamed.push(`${channel.name} -> ${spec.name}`);
    } else {
      try {
        const oldName = channel.name;
        await channel.setName(spec.name, 'Community layout canonical channel name');
        summary.renamed.push(`${oldName} -> ${spec.name}`);
        updateRegistry(guild.id, spec.key, channel, { parentKey: layoutItem.key });
        await wait();
      } catch (error) {
        summary.failed.push(`頻道改名 ${channel.name}: ${error.message}`);
      }
    }
  }

  if (category && channel.parentId !== category.id) {
    if (options.preview) {
      summary.moved.push(`${channel.name} -> ${category.name}`);
    } else {
      try {
        await channel.setParent(category.id, { lockPermissions: false, reason: 'Community layout placement repair' });
        summary.moved.push(`${channel.name} -> ${category.name}`);
        await wait();
      } catch (error) {
        summary.failed.push(`移動頻道 ${channel.name}: ${error.message}`);
      }
    }
  }

  if (options.applyPermissions !== false) {
    if (options.preview) {
      summary.repairedChannels.push(channel.name);
    } else {
      await channel.lockPermissions()
        .then(() => summary.repairedChannels.push(channel.name))
        .catch((error) => summary.warnings.push(`同步權限 ${channel.name}: ${error.message}`));
    }
  }

  if (spec.createEntryGame) {
    if (!options.preview) registerCreateEntryChannel(guild, channel, spec.createEntryGame);
    summary.metadataRegistered.push(`${channel.name} -> ${spec.createEntryGame}`);
  }

  if (options.order) {
    if (options.preview) {
      summary.moved.push(`${channel.name} -> ${layoutItem.name} #${index + 1}`);
    } else {
      await channel.setPosition(index, { reason: 'Community layout channel ordering' }).catch(() => null);
    }
  }

  return channel;
}

async function ensureLayout(guild, summary, options = {}) {
  await ensureRoles(guild, summary, options);
  for (const layoutItem of COMMUNITY_LAYOUT) {
    const category = await ensureCategory(guild, layoutItem, summary, options);
    for (let index = 0; index < layoutItem.channels.length; index += 1) {
      await ensureChannel(guild, layoutItem, category, layoutItem.channels[index], index, summary, options);
    }
  }
}

async function bootstrapCommunity(guild, options = {}) {
  const preview = options.mode === 'preview' || options.preview === true;
  const summary = createSummary(preview ? 'preview' : 'execute');

  if (!preview) {
    await writeServerLog(guild, {
      title: '🧱 Community layout repair started',
      description: 'Bootstrap community layout started.',
      color: 0x5865f2
    }).catch(() => null);
  }

  await ensureLayout(guild, summary, { ...options, preview, order: options.order !== false });
  summary.duplicates = scanDuplicates(guild).map((group) => `${group.name}: ${group.matches.map((item) => item.name).join(', ')}`);

  if (!preview) {
    try {
      await setupCommunityGuide(guild, { mode: 'refresh' });
    } catch (error) {
      summary.warnings.push(`導覽面板更新失敗: ${error.message}`);
    }

    await writeServerLog(guild, {
      title: '✅ Community layout repair completed',
      description: [
        `created categories: ${summary.createdCategories.length}`,
        `created channels: ${summary.createdChannels.length}`,
        `moved: ${summary.moved.length}`,
        `renamed: ${summary.renamed.length}`,
        `failed: ${summary.failed.length}`
      ].join('\n'),
      color: summary.failed.length ? 0xf2c94c : 0x57f287
    }).catch(() => null);
  }

  return summary;
}

async function repairChannelPermissions(guild, options = {}) {
  const preview = options.mode === 'preview' || options.preview === true;
  const summary = createSummary(preview ? 'preview' : 'execute');
  for (const layoutItem of COMMUNITY_LAYOUT) {
    const category = findByRegistry(guild, layoutItem.key, ChannelType.GuildCategory) ||
      findByAliases(guild, layoutItem, ChannelType.GuildCategory);
    if (!category) {
      summary.warnings.push(`缺少分類：${layoutItem.name}`);
      continue;
    }
    updateRegistry(guild.id, layoutItem.key, category);
    if (preview) {
      summary.repairedCategories.push(category.name);
    } else {
      await category.permissionOverwrites.set(getTemplateOverwrites(guild, layoutItem), 'Community permission repair')
        .then(() => summary.repairedCategories.push(category.name))
        .catch((error) => summary.failed.push(`${category.name}: ${error.message}`));
      await wait();
    }

    for (const spec of layoutItem.channels) {
      const channel = findByRegistry(guild, spec.key, spec.type) || findByAliases(guild, spec, spec.type);
      if (!channel) {
        summary.warnings.push(`缺少頻道：${spec.name}`);
        continue;
      }
      updateRegistry(guild.id, spec.key, channel, { parentKey: layoutItem.key });
      if (preview) {
        summary.repairedChannels.push(channel.name);
        continue;
      }
      if (channel.parentId !== category.id) {
        await channel.setParent(category.id, { lockPermissions: false, reason: 'Community permission placement repair' })
          .then(() => summary.moved.push(`${channel.name} -> ${category.name}`))
          .catch((error) => summary.failed.push(`${channel.name} move: ${error.message}`));
      }
      await channel.lockPermissions()
        .then(() => summary.repairedChannels.push(channel.name))
        .catch((error) => summary.failed.push(`${channel.name}: ${error.message}`));
      if (spec.createEntryGame) {
        registerCreateEntryChannel(guild, channel, spec.createEntryGame);
        summary.metadataRegistered.push(`${channel.name} -> ${spec.createEntryGame}`);
      }
      await wait();
    }
  }
  if (!preview) {
    await writeServerLog(guild, {
      title: '🔧 Community permissions repaired',
      description: `categories: ${summary.repairedCategories.length}\nchannels: ${summary.repairedChannels.length}\nfailed: ${summary.failed.length}`,
      color: summary.failed.length ? 0xf2c94c : 0x57f287
    }).catch(() => null);
  }
  summary.duplicates = scanDuplicates(guild).map((group) => `${group.name}: ${group.matches.map((item) => item.name).join(', ')}`);
  return summary;
}

async function rebuildCommunityLayout(guild, options = {}) {
  return bootstrapCommunity(guild, { ...options, order: true });
}

function checkEveryoneCanView(channel) {
  const overwrite = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
  if (overwrite?.deny?.has(PermissionFlagsBits.ViewChannel)) return false;
  if (overwrite?.allow?.has(PermissionFlagsBits.ViewChannel)) return true;
  if (channel.parent) return checkEveryoneCanView(channel.parent);
  return channel.permissionsFor(channel.guild.roles.everyone).has(PermissionFlagsBits.ViewChannel);
}

function checkOnboardingVisibility(guild) {
  const results = [];
  const publicKeys = new Set(PUBLIC_ONBOARDING_CHANNELS);
  for (const layoutItem of COMMUNITY_LAYOUT) {
    for (const spec of layoutItem.channels) {
      const shouldBeVisible = publicKeys.has(spec.key) || spec.onboardingVisible || layoutItem.onboardingVisible;
      const channel = findByRegistry(guild, spec.key, spec.type) || findByAliases(guild, spec, spec.type);
      if (!channel) {
        results.push({ channelName: spec.name, key: spec.key, ok: false, shouldBeVisible, reason: '頻道不存在' });
        continue;
      }
      const visible = checkEveryoneCanView(channel);
      results.push({
        channelName: channel.name,
        key: spec.key,
        ok: shouldBeVisible ? visible : !visible,
        shouldBeVisible,
        reason: shouldBeVisible
          ? (visible ? 'onboarding 可見' : '@everyone 沒有 ViewChannel')
          : (visible ? '此頻道應受限制，但 @everyone 可見' : '已限制')
      });
    }
  }
  return results;
}

function scanDuplicates(guild) {
  const duplicateGroups = [];
  const allConfigs = [
    ...COMMUNITY_LAYOUT.map((category) => ({ config: category, type: ChannelType.GuildCategory, parentKey: null })),
    ...COMMUNITY_LAYOUT.flatMap((category) => category.channels.map((channel) => ({ config: channel, type: channel.type, parentKey: category.key })))
  ];

  for (const item of allConfigs) {
    const aliases = new Set(collectNames(item.config).map(normalizeChannelName));
    const matches = guild.channels.cache.filter((channel) => (
      sameChannelType(channel, item.type) &&
      aliases.has(normalizeChannelName(channel.name))
    ));
    if (matches.size > 1) {
      duplicateGroups.push({
        key: item.config.key,
        name: item.config.name,
        type: item.type === ChannelType.GuildCategory ? 'category' : 'channel',
        parentKey: item.parentKey,
        matches: [...matches.values()].map((channel) => ({
          id: channel.id,
          name: channel.name,
          parentName: channel.parent?.name || null,
          lastMessageId: channel.lastMessageId || null,
          position: channel.rawPosition
        }))
      });
    }
  }
  return duplicateGroups;
}

function layoutDoctor(guild) {
  const missingCore = [];
  const misplaced = [];
  const missingMetadata = [];
  const createEntryStatus = [];
  const registry = readRegistry()[guild.id] || {};

  for (const layoutItem of COMMUNITY_LAYOUT) {
    const category = findByRegistry(guild, layoutItem.key, ChannelType.GuildCategory) ||
      findByAliases(guild, layoutItem, ChannelType.GuildCategory);
    if (!category) missingCore.push(layoutItem.name);
    if (category && !registry[layoutItem.key]) missingMetadata.push(layoutItem.name);

    for (const spec of layoutItem.channels) {
      const channel = findByRegistry(guild, spec.key, spec.type) || findByAliases(guild, spec, spec.type);
      if (!channel) {
        missingCore.push(spec.name);
        continue;
      }
      if (!registry[spec.key]) missingMetadata.push(spec.name);
      if (category && channel.parentId !== category.id) {
        misplaced.push(`${channel.name} -> 應在 ${category.name}`);
      }
      if (spec.createEntryGame) {
        createEntryStatus.push({
          name: channel.name,
          ok: isCreateVoiceChannel(channel),
          game: spec.createEntryGame
        });
      }
    }
  }

  return {
    duplicates: scanDuplicates(guild),
    missingCore,
    misplaced,
    missingMetadata,
    createEntryStatus,
    onboarding: checkOnboardingVisibility(guild)
  };
}

function chooseKeep(guild, group) {
  const registeredId = getRegistryRecord(guild.id, group.key)?.id;
  const registered = group.matches.find((item) => item.id === registeredId);
  if (registered) return registered;
  return [...group.matches].sort((a, b) => {
    if (a.lastMessageId && !b.lastMessageId) return -1;
    if (!a.lastMessageId && b.lastMessageId) return 1;
    return a.position - b.position;
  })[0];
}

function buildDedupePlan(guild, options = {}) {
  const groups = scanDuplicates(guild);
  const actions = [];
  for (const group of groups) {
    const keep = chooseKeep(guild, group);
    for (const match of group.matches) {
      if (match.id === keep.id) continue;
      const channel = guild.channels.cache.get(match.id);
      const reason = protectReason(channel);
      if (reason && group.type !== 'category') {
        actions.push({ type: 'skip', channelId: match.id, channelName: match.name, reason });
        continue;
      }
      actions.push({
        type: group.type === 'category' ? 'archive_category' : 'archive_channel',
        key: group.key,
        keepId: keep.id,
        keepName: keep.name,
        channelId: match.id,
        channelName: match.name,
        reason: `重複 ${group.name}`
      });
    }
  }

  return {
    id: options.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    requestedById: options.requestedById,
    mode: options.mode || 'preview',
    createdAt: Date.now(),
    actions
  };
}

async function ensureArchiveCategory(guild, summary) {
  const archiveLayout = findLayoutCategory('old_archive');
  return ensureCategory(guild, archiveLayout, summary, { preview: false, applyPermissions: true, order: true });
}

async function executeDedupePlan(guild, plan) {
  const summary = createSummary('execute');
  const archive = await ensureArchiveCategory(guild, summary);
  for (const action of plan.actions) {
    if (action.type === 'skip') {
      summary.skipped.push(`${action.channelName}: ${action.reason}`);
      continue;
    }

    const channel = guild.channels.cache.get(action.channelId);
    if (!channel) {
      summary.skipped.push(`${action.channelName}: 已不存在`);
      continue;
    }

    try {
      if (action.type === 'archive_channel') {
        await channel.setParent(archive.id, { lockPermissions: false, reason: 'Dedupe duplicate layout channel' });
        if (isCreateVoiceChannel(channel)) removeCreateEntryRecord(guild.id, channel.id);
        summary.moved.push(`${channel.name} -> ${archive.name}`);
      } else if (action.type === 'archive_category') {
        const children = guild.channels.cache.filter((child) => child.parentId === channel.id);
        for (const child of children.values()) {
          await child.setParent(archive.id, { lockPermissions: false, reason: 'Dedupe duplicate layout category children' });
          summary.moved.push(`${child.name} -> ${archive.name}`);
          await wait();
        }
        const oldName = channel.name;
        await channel.setName(`duplicate-${oldName}`.slice(0, 100), 'Dedupe duplicate layout category marker');
        summary.renamed.push(`${oldName} -> ${channel.name}`);
      }
      await wait();
    } catch (error) {
      summary.failed.push(`${action.channelName}: ${error.message}`);
    }
  }

  await writeServerLog(guild, {
    title: '🧹 Layout duplicate cleanup completed',
    description: `moved: ${summary.moved.length}\nrenamed: ${summary.renamed.length}\nskipped: ${summary.skipped.length}\nfailed: ${summary.failed.length}`,
    color: summary.failed.length ? 0xf2c94c : 0x57f287
  }).catch(() => null);
  return summary;
}

function saveDedupePlan(id, plan) {
  pendingDedupePlans.set(id, plan);
}

function getDedupePlan(id) {
  return pendingDedupePlans.get(id);
}

function deleteDedupePlan(id) {
  pendingDedupePlans.delete(id);
}

function list(items, empty = '無') {
  return items?.length ? items.slice(0, 12).join('\n').slice(0, 1024) : empty;
}

function buildSummaryEmbed(title, summary) {
  return new EmbedBuilder()
    .setColor(summary.failed?.length ? 0xf2c94c : 0x57f287)
    .setTitle(title)
    .setDescription(summary.mode === 'preview' ? '這是預覽，不會修改伺服器。' : '已依穩定 key、alias 與 metadata registry 執行。')
    .addFields(
      { name: '將建立 / 已建立角色', value: list(summary.createdRoles), inline: true },
      { name: '將建立 / 已建立分類', value: list(summary.createdCategories), inline: true },
      { name: '將建立 / 已建立頻道', value: list(summary.createdChannels), inline: true },
      { name: '已存在不動', value: list([...summary.existingCategories, ...summary.existingChannels].slice(0, 20)), inline: false },
      { name: '將移動 / 已移動', value: list(summary.moved), inline: false },
      { name: '將改名 / 已改名', value: list(summary.renamed), inline: false },
      { name: '將修權限 / 已修權限', value: list([...summary.repairedCategories, ...summary.repairedChannels].slice(0, 20)), inline: false },
      { name: '將註冊 / 已註冊 metadata', value: list(summary.metadataRegistered), inline: false },
      { name: '可能重複項目', value: list(summary.duplicates), inline: false },
      { name: '警告', value: list(summary.warnings), inline: false },
      { name: '失敗', value: list(summary.failed), inline: false }
    )
    .setTimestamp();
}

function buildOnboardingCheckEmbed(results) {
  const bad = results.filter((item) => !item.ok);
  return new EmbedBuilder()
    .setColor(bad.length ? 0xf2c94c : 0x57f287)
    .setTitle('🧭 Onboarding Visibility Check')
    .setDescription('檢查 Discord 原生 onboarding 需要看見的入口頻道是否對 @everyone 可見。')
    .addFields(
      { name: '入口可見頻道', value: list(results.filter((item) => item.shouldBeVisible).map((item) => `${item.ok ? '✅' : '❌'} ${item.channelName} - ${item.reason}`)), inline: false },
      { name: '受限內容頻道', value: list(results.filter((item) => !item.shouldBeVisible).map((item) => `${item.ok ? '✅' : '⚠️'} ${item.channelName} - ${item.reason}`)), inline: false },
      { name: '需要處理', value: list(bad.map((item) => `${item.channelName}: ${item.reason}`)), inline: false }
    )
    .setTimestamp();
}

function buildLayoutDoctorEmbed(report) {
  return new EmbedBuilder()
    .setColor(report.missingCore.length || report.misplaced.length || report.duplicates.length ? 0xf2c94c : 0x57f287)
    .setTitle('🩺 Layout Doctor')
    .addFields(
      { name: '重複分類 / 頻道', value: list(report.duplicates.map((group) => `${group.name}: ${group.matches.map((item) => item.name).join(', ')}`)), inline: false },
      { name: '缺少核心頻道', value: list(report.missingCore), inline: false },
      { name: '錯位頻道', value: list(report.misplaced), inline: false },
      { name: '缺 metadata', value: list(report.missingMetadata), inline: false },
      { name: 'Temp Voice 建立入口', value: list(report.createEntryStatus.map((item) => `${item.ok ? '✅' : '⚠️'} ${item.name} -> ${item.game}`)), inline: false },
      { name: 'Onboarding public channels', value: list(report.onboarding.filter((item) => item.shouldBeVisible).map((item) => `${item.ok ? '✅' : '❌'} ${item.channelName}`)), inline: false }
    )
    .setTimestamp();
}

function buildDedupeEmbed(plan) {
  const archive = plan.actions.filter((action) => action.type !== 'skip');
  const skipped = plan.actions.filter((action) => action.type === 'skip');
  return new EmbedBuilder()
    .setColor(archive.length ? 0xf2c94c : 0x57f287)
    .setTitle('🧹 Dedupe Layout Plan')
    .setDescription(plan.mode === 'preview' ? '這是預覽，不會移動任何頻道。' : '按下確認後會把重複項目移到 📦｜舊頻道封存，不會刪除。')
    .addFields(
      { name: '建議封存重複項目', value: list(archive.map((action) => `${action.channelName} -> 保留 ${action.keepName}`)), inline: false },
      { name: '保護略過', value: list(skipped.map((action) => `${action.channelName}: ${action.reason}`)), inline: false }
    )
    .setTimestamp();
}

module.exports = {
  STEP_DELAY_MS,
  bootstrapCommunity,
  buildDedupeEmbed,
  buildDedupePlan,
  buildLayoutDoctorEmbed,
  buildOnboardingCheckEmbed,
  buildSummaryEmbed,
  checkOnboardingVisibility,
  deleteDedupePlan,
  executeDedupePlan,
  findLayoutCategory,
  findLayoutChannel,
  getDedupePlan,
  layoutDoctor,
  normalizeChannelName,
  rebuildCommunityLayout,
  repairChannelPermissions,
  saveDedupePlan
};
