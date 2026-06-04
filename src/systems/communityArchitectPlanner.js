const fs = require('node:fs');
const path = require('node:path');
const { ChannelType } = require('discord.js');
const { validateLayoutAction } = require('../config/communityRules');
const { getAiLayoutSuggestions } = require('./aiLayoutPlanner');
const {
  expectedGameChildName,
  scoreCommunityHealth
} = require('./communityHealthScorer');
const { findGameIdentity, stripGameCategoryPrefix } = require('./gameIdentityService');
const { findDynamicGameMetadataByChannel } = require('./gameChannels');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PLANS_FILE = path.join(DATA_DIR, 'community-architect-plans.json');

const INTEREST_TARGET = '🎨｜興趣交流';
const GAME_ARCHIVE = '📦｜遊戲封存區';
function ensurePlansFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(PLANS_FILE)) fs.writeFileSync(PLANS_FILE, '{}\n', 'utf8');
}

function readPlans() {
  ensurePlansFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(PLANS_FILE, 'utf8') || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function writePlans(data) {
  ensurePlansFile();
  fs.writeFileSync(PLANS_FILE, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function action(type, payload) {
  return {
    type,
    action: type,
    confidence: payload.confidence ?? 90,
    risk: payload.risk || (type === 'archive' || type === 'merge_duplicate_game' ? 'medium' : 'low'),
    requiresConfirmation: type !== 'diagnose',
    ...payload
  };
}

function categoryHasMetadata(guild, category) {
  return Boolean(findDynamicGameMetadataByChannel(guild, category));
}

function categoryActivityScore(guild, category) {
  const children = guild.channels.cache.filter((channel) => channel.parentId === category.id);
  const activeChildren = children.filter((channel) => Boolean(channel.lastMessageId) || channel.members?.size > 0).size;
  return children.size + activeChildren * 3 + (categoryHasMetadata(guild, category) ? 10 : 0);
}

function chooseDuplicateGameKeeper(guild, group) {
  return [...group].sort((a, b) => {
    const aIdentity = findGameIdentity(stripGameCategoryPrefix(a.name));
    const bIdentity = findGameIdentity(stripGameCategoryPrefix(b.name));
    const aCanonical = stripGameCategoryPrefix(a.name) === aIdentity.displayName ? 5 : 0;
    const bCanonical = stripGameCategoryPrefix(b.name) === bIdentity.displayName ? 5 : 0;
    const scoreA = categoryActivityScore(guild, a) + aCanonical;
    const scoreB = categoryActivityScore(guild, b) + bCanonical;
    if (scoreA !== scoreB) return scoreB - scoreA;
    return a.createdTimestamp - b.createdTimestamp;
  })[0];
}

function isScopeEnabled(scope, names) {
  return scope === 'all' || names.includes(scope);
}

function validateArchitectActions(guild, actions) {
  return actions.map((item) => {
    if (['create_category', 'reorder_category', 'repair_metadata', 'merge_duplicate_game', 'create_missing_channel'].includes(item.type)) {
      return item;
    }
    const channel = item.targetId ? guild.channels.cache.get(item.targetId) : null;
    const validation = validateLayoutAction({
      action: item.type === 'merge_duplicate_game' ? 'archive' : item.type,
      targetId: item.targetId,
      targetName: item.targetName,
      newName: item.newName,
      classification: item.classification,
      reason: item.reason
    }, { channel, dynamicGame: channel ? findDynamicGameMetadataByChannel(guild, channel) : null });
    if (validation.allowed) return item;
    return action('suggest', {
      ...item,
      originalType: item.type,
      type: 'suggest',
      action: 'suggest',
      reason: `${validation.reason}；Architect 已降級為建議`
    });
  });
}

async function buildCommunityArchitectPlan(guild, options = {}) {
  const scope = options.scope || 'all';
  const strategy = options.strategy || 'balanced';
  const health = scoreCommunityHealth(guild);
  const actions = [];
  const warnings = [];
  const issues = [];

  if (isScopeEnabled(scope, ['games', 'duplicates'])) {
    for (const group of health.findings.duplicateGames) {
      const keep = chooseDuplicateGameKeeper(guild, group);
      const identity = findGameIdentity(stripGameCategoryPrefix(keep.name));
      issues.push(`🎮 遊戲分類重複：${group.map((item) => stripGameCategoryPrefix(item.name)).join(' / ')}`);
      for (const duplicate of group.filter((item) => item.id !== keep.id)) {
        actions.push(action('merge_duplicate_game', {
          targetId: duplicate.id,
          targetName: duplicate.name,
          keepCategoryId: keep.id,
          keepCategoryName: keep.name,
          targetCategoryName: GAME_ARCHIVE,
          classification: 'duplicate_game_category',
          gameId: identity.id,
          reason: `與 ${keep.name} 為同一 gameId: ${identity.id}`
        }));
      }
    }

    for (const item of health.findings.badGameChildNames) {
      issues.push(`🎮 動態遊戲子頻道命名錯誤：${item.category.name} → ${item.channel.name}`);
      actions.push(action('rename', {
        targetId: item.channel.id,
        targetName: item.channel.name,
        newName: item.expected,
        classification: 'dynamic_game',
        displayName: stripGameCategoryPrefix(item.category.name),
        reason: '統一遊戲子頻道名稱，分類已代表遊戲'
      }));
    }

    for (const name of ['🎯｜熱門遊戲', '🧩｜其他遊戲']) {
      if (!guild.channels.cache.some((channel) => channel.type === ChannelType.GuildCategory && channel.name === name)) {
        actions.push(action('create_category', { targetName: name, reason: '建立遊戲分類分層' }));
      }
    }
  }

  if (isScopeEnabled(scope, ['interests', 'social'])) {
    if (!guild.channels.cache.some((channel) => channel.type === ChannelType.GuildCategory && channel.name === INTEREST_TARGET)) {
      actions.push(action('create_category', { targetName: INTEREST_TARGET, reason: '集中興趣交流頻道' }));
    }
    if (health.findings.scatteredInterests.length) {
      issues.push(`🎨 興趣交流分散：${health.findings.scatteredInterests.map((channel) => channel.name).join('、')}`);
    }
    for (const channel of health.findings.scatteredInterests) {
      actions.push(action('move', {
        targetId: channel.id,
        targetName: channel.name,
        targetCategoryName: INTEREST_TARGET,
        targetCategoryKey: 'interest_zone',
        reason: '集中到興趣交流'
      }));
    }
  }

  if (isScopeEnabled(scope, ['permissions'])) {
    if (health.findings.permissionIssues.length) issues.push(`🔒 權限同步異常：${health.findings.permissionIssues.length} 個子頻道`);
    for (const channel of health.findings.permissionIssues.slice(0, strategy === 'aggressive' ? 50 : 20)) {
      actions.push(action('sync_permission', {
        targetId: channel.id,
        targetName: channel.name,
        reason: '子頻道同步分類權限'
      }));
    }
  }

  const gameCategories = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildCategory && channel.name.startsWith('🎮｜'));
  for (const category of gameCategories.values()) {
    if (/遊戲中心|遊戲大廳/.test(category.name)) continue;
    const identity = findGameIdentity(stripGameCategoryPrefix(category.name));
    const targetCategoryName = identity.tier === 'popular' ? '🎯｜熱門遊戲' : '🧩｜其他遊戲';
    actions.push(action('reorder_category', {
      targetId: category.id,
      targetName: category.name,
      targetCategoryName,
      gameId: identity.id,
      reason: `遊戲分層建議：${targetCategoryName}`
    }));
  }

  let aiNotes = [];
  let aiUsed = false;
  if (process.env.OPENAI_API_KEY) {
    const ai = await getAiLayoutSuggestions(guild, { scope });
    aiUsed = ai.used;
    aiNotes = ai.notes || [];
  } else {
    aiNotes = ['未設定 OPENAI_API_KEY，使用規則與社群架構 heuristics。'];
  }

  const validatedActions = validateArchitectActions(guild, actions)
    .filter((item) => item.type !== 'suggest' || strategy !== 'conservative');

  const plan = {
    planId: options.planId || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    guildId: guild.id,
    createdAt: new Date().toISOString(),
    createdBy: options.createdBy || null,
    scope,
    strategy,
    healthScore: health.total,
    healthSections: health.sections,
    issues,
    suggestions: [
      '合併語意相同遊戲分類',
      '修正動態遊戲子頻道命名',
      '將興趣內容移至 🎨｜興趣交流',
      '建立 🎯｜熱門遊戲 與 🧩｜其他遊戲 分層',
      '修正子頻道權限同步'
    ],
    aiUsed,
    aiNotes,
    actions: validatedActions,
    warnings
  };

  return plan;
}

function saveCommunityArchitectPlan(plan) {
  const data = readPlans();
  if (!data[plan.guildId]) data[plan.guildId] = {};
  data[plan.guildId][plan.planId] = plan;
  data[plan.guildId].latestPlanId = plan.planId;
  writePlans(data);
  return plan;
}

function getCommunityArchitectPlan(guildId, planId = null) {
  const guildPlans = readPlans()[guildId] || {};
  const id = planId || guildPlans.latestPlanId;
  return id ? guildPlans[id] || null : null;
}

function deleteCommunityArchitectPlan(guildId, planId) {
  const data = readPlans();
  if (data[guildId]) {
    delete data[guildId][planId];
    if (data[guildId].latestPlanId === planId) delete data[guildId].latestPlanId;
    writePlans(data);
  }
}

module.exports = {
  buildCommunityArchitectPlan,
  getCommunityArchitectPlan,
  saveCommunityArchitectPlan,
  deleteCommunityArchitectPlan
};
