const fs = require('node:fs');
const path = require('node:path');
const { ChannelType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { COMMUNITY_LAYOUT, PUBLIC_ONBOARDING_CHANNELS } = require('../config/communityLayout');
const { VISIBILITY_TYPES, buildVisibilityOverwrites } = require('../config/channelVisibilityRules');
const { isCreateVoiceChannel, registerCreateEntryChannel, removeCreateEntryRecord } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');
const { writeServerLog } = require('./serverLogs');
const { normalizeChannelName } = require('./communityBootstrapSystem');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REPAIR_PLANS_FILE = path.join(DATA_DIR, 'layout-repair-plans.json');
const REGISTRY_FILE = path.join(DATA_DIR, 'community-layout-registry.json');
const LFG_FILE = path.join(DATA_DIR, 'lfg-cards.json');
const VOICE_HUB_FILE = path.join(DATA_DIR, 'voice-hub.json');
const STEP_DELAY_MS = 900;

function sleep(ms = STEP_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function discordOp(task) {
  try {
    return await task();
  } catch (error) {
    const retryAfter = error.retryAfter || error.rawError?.retry_after || error.data?.retry_after;
    if (!retryAfter) throw error;
    const delay = Math.ceil(Number(retryAfter) * 1000) + 250;
    await sleep(Number.isFinite(delay) ? delay : 1500);
    return task();
  }
}

function ensureDataFile(file, fallback = '{}\n') {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, fallback, 'utf8');
}

function readJson(file) {
  ensureDataFile(file);
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch (error) {
    console.error(`[LayoutDecision] read failed ${file}:`, error);
    return {};
  }
}

function writeJson(file, data) {
  ensureDataFile(file);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function flattenLayout() {
  return COMMUNITY_LAYOUT.flatMap((category) => [
    { kind: 'category', category, config: category },
    ...category.channels.map((channel) => ({ kind: 'channel', category, config: channel }))
  ]);
}

function sameType(channel, expectedType) {
  if (!channel) return false;
  if (expectedType === ChannelType.GuildText) return channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement;
  return channel.type === expectedType;
}

function findExpectedChannel(guild, config, expectedType) {
  const key = config.key;
  const registry = readJson(REGISTRY_FILE)[guild.id] || {};
  const registered = registry[key]?.id ? guild.channels.cache.get(registry[key].id) : null;
  if (sameType(registered, expectedType)) return registered;

  const aliases = new Set([config.key, config.name, ...(config.aliases || [])].map(normalizeChannelName));
  return guild.channels.cache.find((channel) => sameType(channel, expectedType) && aliases.has(normalizeChannelName(channel.name))) || null;
}

function writeRegistryRecord(guild, key, channel, parentKey = null) {
  const registry = readJson(REGISTRY_FILE);
  if (!registry[guild.id]) registry[guild.id] = {};
  registry[guild.id][key] = {
    id: channel.id,
    type: channel.type === ChannelType.GuildCategory ? 'category' : 'channel',
    parentKey,
    lastSeenName: channel.name,
    updatedAt: new Date().toISOString()
  };
  writeJson(REGISTRY_FILE, registry);
}

function buildExpectedIndex(guild) {
  const byChannelId = new Map();
  const byKey = new Map();
  for (const item of flattenLayout()) {
    const expectedType = item.kind === 'category' ? ChannelType.GuildCategory : item.config.type;
    const channel = findExpectedChannel(guild, item.config, expectedType);
    const record = { ...item, current: channel || null };
    byKey.set(item.config.key, record);
    if (channel) byChannelId.set(channel.id, record);
  }
  return { byChannelId, byKey };
}

function isMetadataChannel(guild, channel) {
  const lfg = readJson(LFG_FILE)[guild.id] || {};
  const voiceHub = readJson(VOICE_HUB_FILE)[guild.id] || {};
  if (Object.values(lfg).some((record) => record?.messageId === channel.id || record?.voiceChannelId === channel.id)) return true;
  if (voiceHub.channelId === channel.id || voiceHub.messageId === channel.id) return true;
  return false;
}

function protectedReason(guild, channel, expectedRecord = null) {
  if (!channel) return '頻道不存在';
  if (expectedRecord) return '核心 layout 頻道';
  if (channel.id === guild.systemChannelId || channel.id === guild.rulesChannelId || channel.id === guild.publicUpdatesChannelId) return 'Discord 系統頻道';
  if (channel.name.startsWith('ticket-')) return 'Ticket 私人頻道';
  if (/server-logs|ticket-logs|bot-control|語音控制台/i.test(channel.name)) return 'logs / bot control';
  if (isTempVoice(guild.id, channel.id)) return 'active temp voice';
  if (/組隊招募|目前語音房|遊戲提議|開啟客服單|一般聊天|深夜聊天|找隊友大廳/.test(channel.name)) return '社群核心功能頻道';
  if (isMetadataChannel(guild, channel)) return 'metadata 記錄頻道';
  return null;
}

function isDeleteNameCandidate(name) {
  return /^(delete-pending|test-|temp-test|old-unused)/i.test(name);
}

function isArchiveNameCandidate(name) {
  return /^(old-|unused-|duplicate-|empty-)|舊|封存|廢棄/i.test(name);
}

function channelHasActivity(channel) {
  return Boolean(channel.lastMessageId) || (channel.members && channel.members.size > 0);
}

function getChannelPurposeTags(channel) {
  const text = `${channel.name} ${channel.parent?.name || ''}`.toLowerCase();
  const tags = new Set();
  if (/一般聊天|聊天|閒聊|general/.test(text)) tags.add('general_chat');
  if (/認真討論|科技|ai|觀點|長篇/.test(text)) tags.add('serious_discussion');
  if (/找隊友|組隊|party|lfg/.test(text)) tags.add('party');
  if (/音樂|music/.test(text)) tags.add('music');
  if (/美食|料理|food/.test(text)) tags.add('food');
  if (/迷因|好圖|圖片|梗圖|meme|image/.test(text)) tags.add('images');
  if (/活動公告|活動|投票|比賽|排行|抽獎|event/.test(text)) tags.add('event');
  if (/server-logs|ticket-logs|bot-control|管理|後台/.test(text)) tags.add('admin');
  if (/ticket-|客服|支援/.test(text)) tags.add('support');
  return [...tags];
}

function classifyChannel(channel, expectedRecord = null) {
  if (expectedRecord) return { type: 'core_channel', confidence: 100, tags: getChannelPurposeTags(channel), reason: '已在標準 layout 中' };
  const tags = getChannelPurposeTags(channel);
  const hasActivity = channelHasActivity(channel);
  const name = channel.name;

  if (/音樂分享|美食分享|迷因與好圖|好圖分享|攝影分享|影劇動漫/i.test(name)) {
    return {
      type: hasActivity ? 'low_activity_channel' : 'interest_channel',
      confidence: 82,
      tags,
      targetCategoryKey: 'interest_zone',
      reason: '興趣交流頻道，不屬於相似頻道'
    };
  }

  if (/閒聊討論/i.test(name)) {
    return {
      type: 'duplicate_channel',
      confidence: 88,
      tags,
      targetName: '🧠｜認真討論',
      reason: '與認真討論用途重疊，適合語意清理'
    };
  }

  if (!hasActivity && !tags.length && !isMetadataChannel(channel.guild, channel)) {
    return { type: 'dead_channel', confidence: 80, tags, reason: '無近期活動、無 metadata、用途不明' };
  }

  return { type: 'unknown', confidence: 55, tags, reason: '用途不明，需要人工判斷' };
}

function isSimilarChannelMergeCandidate(channel) {
  const classification = typeof channel === 'string'
    ? { type: /閒聊討論/i.test(channel) ? 'duplicate_channel' : 'unknown', confidence: /閒聊討論/i.test(channel) ? 88 : 0 }
    : classifyChannel(channel);
  return classification.type === 'duplicate_channel' && classification.confidence >= 85;
}

function isEmptyOrTestChannel(channel) {
  return !channelHasActivity(channel) || /test-|測試|empty-|空白/i.test(channel.name);
}

function isEveryoneViewAllowed(channel) {
  const overwrite = channel.permissionOverwrites.cache.get(channel.guild.roles.everyone.id);
  if (overwrite?.deny?.has(PermissionFlagsBits.ViewChannel)) return false;
  if (overwrite?.allow?.has(PermissionFlagsBits.ViewChannel)) return true;
  if (channel.parent) return isEveryoneViewAllowed(channel.parent);
  return channel.permissionsFor(channel.guild.roles.everyone)?.has(PermissionFlagsBits.ViewChannel) ?? false;
}

function permissionHealth(record) {
  const channel = record.current;
  if (!channel) return { ok: false, reason: '不存在' };
  const type = record.config.visibilityType || record.category.visibilityType || VISIBILITY_TYPES.publicEntry;
  const publicTypes = new Set([VISIBILITY_TYPES.publicEntry, VISIBILITY_TYPES.publicSocial, VISIBILITY_TYPES.semiPublicReadonly]);
  const everyoneCanView = isEveryoneViewAllowed(channel);
  if (publicTypes.has(type) && !everyoneCanView) return { ok: false, reason: `${type} 應公開但 @everyone 不可見` };
  if (!publicTypes.has(type) && everyoneCanView) return { ok: false, reason: `${type} 應限制但 @everyone 可見` };
  return { ok: true, reason: '權限方向正確' };
}

function action(type, payload) {
  const riskByType = {
    create_category: 'low',
    create_channel: 'low',
    rename: 'low',
    move: 'low',
    sync_permission: 'medium',
    archive: 'medium',
    delete: 'high',
    keep: 'low'
  };
  return {
    action: type,
    type,
    confidence: payload.confidence ?? 90,
    risk: payload.risk || riskByType[type] || 'medium',
    requiresConfirmation: type !== 'keep',
    ...payload
  };
}

function getActionType(item) {
  return item.action || item.type;
}

function inferRenamePriority(oldName, newName) {
  const withoutCaseOld = oldName.toLowerCase();
  const withoutCaseNew = newName.toLowerCase();
  if (withoutCaseOld === withoutCaseNew && oldName !== newName) return 'casing normalize';
  if (!/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(oldName) && /^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u.test(newName)) return 'emoji consistency';
  if (/閒聊討論/.test(oldName) && /認真討論/.test(newName)) return 'semantic cleanup';
  if (/\b\d-/.test(oldName) || /^.?｜\d-/.test(oldName)) return 'game naming consistency';
  return 'semantic cleanup';
}

function filterActionsByOptimizationMode(actions, optimizationMode = 'balanced') {
  if (optimizationMode === 'conservative') {
    return actions.filter((item) => ['sync_permission', 'sync_metadata', 'keep'].includes(getActionType(item)));
  }
  if (optimizationMode === 'aggressive') return actions;
  return actions.filter((item) => {
    const type = getActionType(item);
    if (type === 'delete') return false;
    if (type === 'archive' && item.classification !== 'duplicate_channel') return false;
    return true;
  });
}

function shouldIncludeScope(scope, record) {
  if (scope === 'all') return true;
  const type = record.config.visibilityType || record.category.visibilityType;
  if (scope === 'permissions') return true;
  if (scope === 'onboarding') return PUBLIC_ONBOARDING_CHANNELS.includes(record.config.key) || record.config.onboardingVisible || record.category.onboardingVisible;
  if (scope === 'admin') return type === VISIBILITY_TYPES.privateAdmin;
  if (scope === 'games') return record.category.key?.startsWith('game_') || record.config.key?.startsWith('game_') || record.category.key === 'game_center';
  if (scope === 'restricted') return [VISIBILITY_TYPES.roleRestricted, VISIBILITY_TYPES.hiddenSpecial].includes(type);
  return true;
}

function buildDuplicateActions(guild, expectedIndex, scope) {
  if (!['all', 'duplicates'].includes(scope)) return [];
  const groups = new Map();
  for (const channel of guild.channels.cache.values()) {
    const key = `${channel.type}:${normalizeChannelName(channel.name)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(channel);
  }

  const actions = [];
  for (const channels of groups.values()) {
    if (channels.length < 2) continue;
    const sorted = [...channels].sort((a, b) => {
      const aExpected = expectedIndex.byChannelId.has(a.id) ? 1 : 0;
      const bExpected = expectedIndex.byChannelId.has(b.id) ? 1 : 0;
      if (aExpected !== bExpected) return bExpected - aExpected;
      const aMeta = isMetadataChannel(guild, a) ? 1 : 0;
      const bMeta = isMetadataChannel(guild, b) ? 1 : 0;
      if (aMeta !== bMeta) return bMeta - aMeta;
      const aActive = channelHasActivity(a) ? 1 : 0;
      const bActive = channelHasActivity(b) ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return a.rawPosition - b.rawPosition;
    });
    const keep = sorted[0];
    for (const duplicate of sorted.slice(1)) {
      const reason = protectedReason(guild, duplicate, expectedIndex.byChannelId.get(duplicate.id));
      if (reason && !isCreateVoiceChannel(duplicate)) {
        actions.push(action('keep', {
          targetId: duplicate.id,
          targetName: duplicate.name,
          reason: `重複但受保護：${reason}`,
          confidence: 100
        }));
        continue;
      }
      actions.push(action('archive', {
        targetId: duplicate.id,
        targetName: duplicate.name,
        targetCategoryKey: 'old_archive',
        reason: `重複項目，保留 ${keep.name}`,
        confidence: 88,
        risk: 'medium'
      }));
    }
  }
  return actions;
}

function buildMissingAndRepairActions(guild, expectedIndex, scope) {
  const actions = [];
  for (const record of expectedIndex.byKey.values()) {
    if (!shouldIncludeScope(scope, record)) continue;
    const expectedType = record.kind === 'category' ? ChannelType.GuildCategory : record.config.type;
    if (!record.current) {
      actions.push(action(record.kind === 'category' ? 'create_category' : 'create_channel', {
        key: record.config.key,
        targetName: record.config.name,
        targetCategoryKey: record.kind === 'channel' ? record.category.key : null,
        channelType: expectedType,
        userLimit: record.config.userLimit,
        reason: '核心 layout 項目缺少',
        confidence: 95,
        risk: 'low'
      }));
      continue;
    }

    if (record.current.name !== record.config.name) {
      actions.push(action('rename', {
        targetId: record.current.id,
        targetName: record.current.name,
        newName: record.config.name,
        reason: '名稱與 canonical layout 不一致',
        renamePriority: inferRenamePriority(record.current.name, record.config.name),
        confidence: 96,
        risk: 'low'
      }));
    }

    if (record.kind === 'channel') {
      const categoryRecord = expectedIndex.byKey.get(record.category.key);
      if (categoryRecord?.current && record.current.parentId !== categoryRecord.current.id) {
        actions.push(action('move', {
          targetId: record.current.id,
          targetName: record.current.name,
          targetCategoryKey: record.category.key,
          targetCategoryId: categoryRecord.current.id,
          reason: `頻道位置錯誤，應在 ${record.category.name}`,
          confidence: 95,
          risk: 'low'
        }));
      }
      if (record.config.createEntryGame) {
        actions.push(action('sync_metadata', {
          targetId: record.current.id,
          targetName: record.current.name,
          game: record.config.createEntryGame,
          reason: '同步 Temp Voice create entry metadata',
          confidence: 100,
          risk: 'low'
        }));
      }
    }

    const health = permissionHealth(record);
    if (!health.ok || scope === 'permissions') {
      actions.push(action('sync_permission', {
        targetId: record.current.id,
        targetName: record.current.name,
        key: record.config.key,
        visibilityType: record.config.visibilityType || record.category.visibilityType,
        roleName: record.config.roleName || record.category.roleName,
        specialRoleName: record.config.specialRoleName || record.category.specialRoleName,
        reason: health.reason,
        confidence: health.ok ? 80 : 92,
        risk: 'medium'
      }));
    }
  }
  return actions;
}

function buildUnmanagedActions(guild, expectedIndex, scope, aiVotes = []) {
  if (!['all', 'archives'].includes(scope)) return [];
  const actions = [];
  const aiById = new Map(aiVotes.map((vote) => [vote.channelId, vote]));

  for (const channel of guild.channels.cache.values()) {
    if (expectedIndex.byChannelId.has(channel.id)) continue;
    const protection = protectedReason(guild, channel);
    if (protection) {
      actions.push(action('keep', {
        targetId: channel.id,
        targetName: channel.name,
        reason: protection,
        confidence: 100
      }));
      continue;
    }

    if (channel.type === ChannelType.GuildCategory) {
      const children = guild.channels.cache.filter((child) => child.parentId === channel.id);
      if (children.size === 0) {
        actions.push(action('delete', {
          targetId: channel.id,
          targetName: channel.name,
          reason: '空分類且非 protected',
          confidence: 86,
          risk: 'high'
        }));
      }
      continue;
    }

    const ai = aiById.get(channel.id);
    const canDeleteByName = isDeleteNameCandidate(channel.name);
    const inactive = !channelHasActivity(channel);
    const classification = classifyChannel(channel);

    if (classification.type === 'duplicate_channel' && classification.confidence >= 85) {
      actions.push(action('rename', {
        targetId: channel.id,
        targetName: channel.name,
        newName: classification.targetName || '🧠｜認真討論',
        reason: classification.reason,
        renamePriority: inferRenamePriority(channel.name, classification.targetName || '🧠｜認真討論'),
        classification: classification.type,
        confidence: classification.confidence,
        risk: 'low'
      }));
      continue;
    }

    if (classification.type === 'interest_channel') {
      actions.push(action('move', {
        targetId: channel.id,
        targetName: channel.name,
        targetCategoryKey: classification.targetCategoryKey,
        reason: classification.reason,
        classification: classification.type,
        confidence: classification.confidence,
        risk: 'low'
      }));
      continue;
    }

    if (classification.type === 'low_activity_channel') {
      actions.push(action('move', {
        targetId: channel.id,
        targetName: channel.name,
        targetCategoryKey: classification.targetCategoryKey,
        reason: '低活躍興趣頻道，移到興趣交流而不是合併',
        classification: classification.type,
        confidence: classification.confidence,
        risk: 'low'
      }));
      continue;
    }

    if (classification.type === 'dead_channel' && classification.confidence >= 75) {
      actions.push(action(isEmptyOrTestChannel(channel) ? 'delete' : 'archive', {
        targetId: channel.id,
        targetName: channel.name,
        targetCategoryKey: 'old_archive',
        reason: classification.reason,
        classification: classification.type,
        confidence: classification.confidence,
        risk: isEmptyOrTestChannel(channel) ? 'high' : 'medium'
      }));
      continue;
    }

    if (ai && ai.confidence < 70) {
      actions.push(action('keep', {
        targetId: channel.id,
        targetName: channel.name,
        reason: `AI 信心低於 70，只列建議不執行：${ai.reason || '未提供原因'}`,
        confidence: ai.confidence,
        classification: 'suggest_only'
      }));
      continue;
    }

    if (canDeleteByName || (inactive && ai?.action === 'delete' && ai.confidence >= 80)) {
      actions.push(action('delete', {
        targetId: channel.id,
        targetName: channel.name,
        reason: canDeleteByName ? '名稱符合 delete policy' : `AI 與規則皆判定可刪：${ai.reason}`,
        confidence: canDeleteByName ? 88 : Math.min(ai.confidence, 90),
        risk: 'high'
      }));
      continue;
    }

    if (isArchiveNameCandidate(channel.name) || inactive || ai?.action === 'archive') {
      actions.push(action('archive', {
        targetId: channel.id,
        targetName: channel.name,
        targetCategoryKey: 'old_archive',
        reason: ai?.reason || '非核心頻道且低活動或疑似舊頻道',
        confidence: ai?.confidence || 72,
        risk: 'medium'
      }));
    }
  }
  return actions;
}

function buildLayoutRepairPlan(guild, options = {}) {
  const scope = options.scope || 'all';
  const optimizationMode = options.optimizationMode || 'balanced';
  const expectedIndex = buildExpectedIndex(guild);
  const actions = [
    ...buildMissingAndRepairActions(guild, expectedIndex, scope),
    ...buildDuplicateActions(guild, expectedIndex, scope),
    ...buildUnmanagedActions(guild, expectedIndex, scope, options.aiVotes || [])
  ];

  const unique = [];
  const seen = new Set();
  for (const item of actions) {
    const dedupeKey = `${item.action}:${item.targetId || item.key}:${item.newName || item.targetCategoryKey || ''}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    unique.push(item);
  }
  const filtered = filterActionsByOptimizationMode(unique, optimizationMode);

  return {
    id: options.id || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    requestedById: options.requestedById,
    scope,
    optimizationMode,
    mode: options.mode || 'preview',
    deleteConfirmText: options.deleteConfirmText || '',
    aiUsed: Boolean(options.aiUsed),
    aiNotes: options.aiNotes || [],
    createdAt: Date.now(),
    actions: filtered
  };
}

function saveLayoutRepairPlan(plan) {
  const data = readJson(REPAIR_PLANS_FILE);
  data[plan.id] = plan;
  writeJson(REPAIR_PLANS_FILE, data);
}

function getLayoutRepairPlan(id) {
  return readJson(REPAIR_PLANS_FILE)[id] || null;
}

function deleteLayoutRepairPlan(id) {
  const data = readJson(REPAIR_PLANS_FILE);
  delete data[id];
  writeJson(REPAIR_PLANS_FILE, data);
}

async function findOrCreateArchiveCategory(guild, summary) {
  const archiveConfig = COMMUNITY_LAYOUT.find((category) => category.key === 'old_archive');
  let archive = findExpectedChannel(guild, archiveConfig, ChannelType.GuildCategory);
  if (archive) return archive;
  archive = await discordOp(() => guild.channels.create({
    name: archiveConfig.name,
    type: ChannelType.GuildCategory,
    permissionOverwrites: buildVisibilityOverwrites(guild, archiveConfig),
    reason: 'Layout repair archive category setup'
  }));
  writeRegistryRecord(guild, archiveConfig.key, archive);
  summary.created.push(archive.name);
  await sleep();
  return archive;
}

async function executeOneAction(guild, item, summary, options = {}) {
  const channel = item.targetId ? guild.channels.cache.get(item.targetId) : null;
  const itemType = getActionType(item);
  try {
    if (itemType === 'keep') {
      summary.skipped.push(`${item.targetName}: ${item.reason}`);
      return;
    }

    if (itemType === 'create_category') {
      const config = COMMUNITY_LAYOUT.find((category) => category.key === item.key);
      const created = await discordOp(() => guild.channels.create({
        name: config.name,
        type: ChannelType.GuildCategory,
        permissionOverwrites: buildVisibilityOverwrites(guild, config),
        reason: 'AI layout repair create category'
      }));
      writeRegistryRecord(guild, config.key, created);
      summary.created.push(created.name);
      return;
    }

    if (itemType === 'create_channel') {
      const record = flattenLayout().find((entry) => entry.config.key === item.key);
      const parent = record ? findExpectedChannel(guild, record.category, ChannelType.GuildCategory) : null;
      if (!record || !parent) {
        summary.failed.push(`${item.targetName}: 缺少目標分類`);
        return;
      }
      const created = await discordOp(() => guild.channels.create({
        name: record.config.name,
        type: record.config.type,
        parent: parent.id,
        userLimit: record.config.userLimit,
        permissionOverwrites: buildVisibilityOverwrites(guild, { ...record.category, ...record.config }),
        reason: 'AI layout repair create channel'
      }));
      writeRegistryRecord(guild, record.config.key, created, record.category.key);
      if (record.config.createEntryGame) registerCreateEntryChannel(guild, created, record.config.createEntryGame);
      summary.created.push(created.name);
      return;
    }

    if (!channel) {
      summary.skipped.push(`${item.targetName}: 已不存在`);
      return;
    }

    if (protectedReason(guild, channel) && ['archive', 'delete'].includes(itemType)) {
      summary.skipped.push(`${channel.name}: protected，不執行 ${itemType}`);
      return;
    }

    if (itemType === 'rename') {
      if (!item.newName || channel.name === item.newName) {
        summary.skipped.push(`${channel.name}: rename skipped`);
        return;
      }
      await discordOp(() => channel.setName(item.newName, `AI layout repair rename: ${item.renamePriority || 'normalize'}`));
      summary.renamed.push(`✅ ${item.targetName} -> ${item.newName}`);
      await writeServerLog(guild, {
        title: '✅ rename success',
        description: `${item.targetName} -> ${item.newName}\npriority: ${item.renamePriority || 'normalize'}`,
        color: 0x57f287
      }).catch(() => null);
      return;
    }

    if (itemType === 'move') {
      const category = guild.channels.cache.get(item.targetCategoryId) ||
        findExpectedChannel(guild, COMMUNITY_LAYOUT.find((entry) => entry.key === item.targetCategoryKey), ChannelType.GuildCategory);
      if (!category) {
        summary.failed.push(`${channel.name}: 找不到目標分類 ${item.targetCategoryKey}`);
        return;
      }
      await discordOp(() => channel.setParent(category.id, { lockPermissions: false, reason: 'AI layout repair move' }));
      summary.moved.push(`${channel.name} -> ${category.name}`);
      return;
    }

    if (itemType === 'sync_permission') {
      const record = flattenLayout().find((entry) => entry.config.key === item.key);
      const rule = record
        ? { ...record.category, ...record.config, roleName: record.config.roleName || record.category.roleName, specialRoleName: record.config.specialRoleName || record.category.specialRoleName }
        : item;
      await discordOp(() => channel.permissionOverwrites.set(buildVisibilityOverwrites(guild, rule), 'AI layout repair sync permission'));
      summary.permissions.push(channel.name);
      return;
    }

    if (itemType === 'sync_metadata') {
      registerCreateEntryChannel(guild, channel, item.game);
      summary.metadata.push(`${channel.name} -> ${item.game}`);
      return;
    }

    if (itemType === 'archive') {
      const archive = await findOrCreateArchiveCategory(guild, summary);
      await discordOp(() => channel.setParent(archive.id, { lockPermissions: false, reason: 'AI layout repair archive' }));
      if (isCreateVoiceChannel(channel)) removeCreateEntryRecord(guild.id, channel.id);
      summary.archived.push(channel.name);
      return;
    }

    if (itemType === 'delete') {
      if (!options.allowDelete) {
        summary.skipped.push(`${channel.name}: 缺少 DELETE CONFIRM，略過刪除`);
        return;
      }
      await writeServerLog(guild, {
        title: '🗑️ Layout repair delete pending',
        description: `channel: ${channel.name}\nid: ${channel.id}\ncategory: ${channel.parent?.name || 'none'}\nreason: ${item.reason}`,
        color: 0xeb5757
      }).catch(() => null);
      if (!channel.name.startsWith('deleting-')) {
        await discordOp(() => channel.setName(`deleting-${channel.name}`.slice(0, 95), 'Layout repair delete pending'));
        await sleep(1000);
      }
      await discordOp(() => channel.delete(`Layout repair delete: ${item.reason}`));
      summary.deleted.push(item.targetName);
    }
  } catch (error) {
    summary.failed.push(`❌ ${itemType} ${item.targetName || item.key}: ${error.message}`);
    if (itemType === 'rename') {
      await writeServerLog(guild, {
        title: '❌ rename failed',
        description: `${item.targetName} -> ${item.newName}\n${error.message}`,
        color: 0xeb5757
      }).catch(() => null);
    }
  } finally {
    await sleep();
  }
}

async function executeLayoutRepairPlan(guild, plan, options = {}) {
  const summary = {
    created: [],
    renamed: [],
    moved: [],
    permissions: [],
    metadata: [],
    archived: [],
    deleted: [],
    skipped: [],
    failed: []
  };
  const allowDelete = options.allowDelete || plan.deleteConfirmText === 'DELETE CONFIRM';

  await writeServerLog(guild, {
    title: '🛠️ Layout repair started',
    description: `scope: ${plan.scope}\nactions: ${plan.actions.length}\nallowDelete: ${allowDelete}`,
    color: 0x5865f2
  }).catch(() => null);

  for (const item of plan.actions) {
    await executeOneAction(guild, item, summary, { allowDelete });
  }

  await writeServerLog(guild, {
    title: '✅ Layout repair completed',
    description: [
      `created: ${summary.created.length}`,
      `renamed: ${summary.renamed.length}`,
      `moved: ${summary.moved.length}`,
      `permissions: ${summary.permissions.length}`,
      `archived: ${summary.archived.length}`,
      `deleted: ${summary.deleted.length}`,
      `failed: ${summary.failed.length}`
    ].join('\n'),
    color: summary.failed.length ? 0xf2c94c : 0x57f287
  }).catch(() => null);

  return summary;
}

function groupActions(plan) {
  const groups = {
    create: [],
    permissions: [],
    metadata: [],
    rename: [],
    move: [],
    archive: [],
    delete: [],
    keep: [],
    highRisk: []
  };
  for (const item of plan.actions) {
    const itemType = getActionType(item);
    if (itemType === 'create_category' || itemType === 'create_channel') groups.create.push(item);
    else if (itemType === 'sync_permission') groups.permissions.push(item);
    else if (itemType === 'sync_metadata') groups.metadata.push(item);
    else if (itemType === 'rename') groups.rename.push(item);
    else if (itemType === 'move') groups.move.push(item);
    else if (itemType === 'archive') groups.archive.push(item);
    else if (itemType === 'delete') groups.delete.push(item);
    else groups.keep.push(item);
    if (item.risk === 'high') groups.highRisk.push(item);
  }
  return groups;
}

function lines(items, mapper, empty = '無') {
  if (!items.length) return empty;
  return items.slice(0, 12).map(mapper).join('\n').slice(0, 1024);
}

function buildLayoutRepairEmbed(plan, title = '🛠️ Layout Repair Plan') {
  const groups = groupActions(plan);
  const embed = new EmbedBuilder()
    .setColor(groups.delete.length || groups.highRisk.length ? 0xeb5757 : 0x5865f2)
    .setTitle(title)
    .setDescription([
      `mode: ${plan.mode}`,
      `scope: ${plan.scope}`,
      `optimizationMode: ${plan.optimizationMode || 'balanced'}`,
      `AI: ${plan.aiUsed ? '已參與建議，仍由規則引擎驗證' : '未使用或未設定 OPENAI_API_KEY'}`,
      groups.delete.length ? '刪除動作 execute 需要 `DELETE CONFIRM`。' : null
    ].filter(Boolean).join('\n'))
    .addFields(
      { name: '將建立', value: lines(groups.create, (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '將修權限', value: lines(groups.permissions, (item) => `${item.targetName} - ${item.visibilityType}`), inline: false },
      { name: '將同步 metadata', value: lines(groups.metadata, (item) => `${item.targetName} - ${item.game}`), inline: false },
      { name: '將改名', value: lines(groups.rename, (item) => `${item.targetName} -> ${item.newName} (${item.renamePriority || 'normalize'})`), inline: false },
      { name: '將搬移', value: lines(groups.move, (item) => `${item.targetName} -> ${item.targetCategoryKey}`), inline: false },
      { name: '將封存', value: lines(groups.archive, (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '將刪除', value: lines(groups.delete, (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '不處理原因', value: lines(groups.keep, (item) => `${item.targetName}: ${item.reason}`), inline: false },
      { name: '高風險項目', value: lines(groups.highRisk, (item) => `${item.action}: ${item.targetName}`), inline: false }
    )
    .setTimestamp();
  if (plan.aiNotes?.length) {
    embed.addFields({ name: 'AI 補充', value: plan.aiNotes.slice(0, 5).join('\n').slice(0, 1024), inline: false });
  }
  return embed;
}

function buildLayoutDoctorReport(guild) {
  const expectedIndex = buildExpectedIndex(guild);
  const plan = buildLayoutRepairPlan(guild, { scope: 'all', mode: 'preview' });
  const visibility = [];
  const unsynced = [];
  for (const record of expectedIndex.byKey.values()) {
    if (!record.current) continue;
    const health = permissionHealth(record);
    const type = record.config.visibilityType || record.category.visibilityType;
    visibility.push(`${health.ok ? '✅' : '❌'} ${record.current.name} - ${type} - ${health.reason}`);
    if (record.kind === 'channel' && record.current.parent) {
      const parentOverwrites = [...record.current.parent.permissionOverwrites.cache.keys()].sort().join(',');
      const childOverwrites = [...record.current.permissionOverwrites.cache.keys()].sort().join(',');
      if (parentOverwrites !== childOverwrites && !record.config.visibilityType) unsynced.push(record.current.name);
    }
  }
  return {
    visibility,
    unsynced,
    plan
  };
}

module.exports = {
  VISIBILITY_TYPES,
  buildLayoutDoctorReport,
  buildLayoutRepairEmbed,
  buildLayoutRepairPlan,
  classifyChannel,
  deleteLayoutRepairPlan,
  executeLayoutRepairPlan,
  getLayoutRepairPlan,
  protectedReason,
  saveLayoutRepairPlan
};
