const { ChannelType } = require('discord.js');

const PUBLIC_LOBBY_CATEGORY = '💬｜公開大廳';
const DAILY_LOBBY_CATEGORY = '💬｜日常交流';
const ARCHIVE_CATEGORY = '📦｜舊頻道封存';

const protectedChannelKeywords = [
  '閒聊',
  '一般聊天',
  '找隊友',
  '戰績',
  '資訊',
  '聊天'
];

const lifeChannelRules = [
  { keyword: '閒聊討論', categoryName: PUBLIC_LOBBY_CATEGORY, aliases: ['🧠｜閒聊討論', '🧠｜認真討論'] },
  { keyword: '認真討論', categoryName: PUBLIC_LOBBY_CATEGORY, aliases: ['🧠｜認真討論', '🧠｜閒聊討論'] },
  { keyword: '一般聊天', categoryName: PUBLIC_LOBBY_CATEGORY, aliases: ['💬｜一般聊天'] },
  { keyword: '好圖分享', categoryName: PUBLIC_LOBBY_CATEGORY, aliases: ['🖼｜好圖分享'] }
];

const gamePrefixRules = [
  { prefix: 'apex-', categoryName: '🎮｜APEX' },
  { prefix: 'tft-', categoryName: '🎮｜聯盟戰棋' },
  { prefix: 'lol-', categoryName: '🎮｜LOL' },
  { prefix: 'mc-', categoryName: '🎮｜Minecraft' },
  { prefix: '特戰-', categoryName: '🎮｜特戰英豪' }
];

const gameChannelOrderKeywords = ['聊天', '找隊友', '戰績分享', '資訊', '建立'];
const pendingRestoreActiveChannelPlans = new Map();

function normalizeName(name) {
  return String(name || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}-]+/gu, '');
}

function getComparableName(channelOrName) {
  return normalizeName(typeof channelOrName === 'string' ? channelOrName : channelOrName.name);
}

function hasProtectedChannelKeyword(channelOrName) {
  const normalized = getComparableName(channelOrName);
  return protectedChannelKeywords.some((keyword) => normalized.includes(normalizeName(keyword)));
}

function inferActiveChannelTarget(channelOrName) {
  const rawName = typeof channelOrName === 'string' ? channelOrName : channelOrName.name;
  const normalized = getComparableName(rawName);

  for (const rule of lifeChannelRules) {
    const names = [rule.keyword, ...rule.aliases];
    if (names.some((name) => normalized.includes(normalizeName(name)))) {
      return {
        categoryName: rule.categoryName,
        reason: `有效生活頻道：${rule.keyword}`
      };
    }
  }

  for (const rule of gamePrefixRules) {
    if (normalized.startsWith(normalizeName(rule.prefix))) {
      return {
        categoryName: rule.categoryName,
        reason: `有效遊戲前綴：${rule.prefix}`
      };
    }
  }

  if (hasProtectedChannelKeyword(rawName)) {
    return {
      categoryName: PUBLIC_LOBBY_CATEGORY,
      reason: '命中 protectedChannelKeywords，移到公開大廳人工整理'
    };
  }

  return null;
}

function isActiveProtectedChannel(channelOrName) {
  return Boolean(inferActiveChannelTarget(channelOrName));
}

function isArchiveCategoryName(name) {
  return ['📦｜舊頻道封存', '📦｜封存區', '📦｜待刪除分類', '舊頻道封存', '封存區'].some((keyword) => String(name || '').includes(keyword));
}

function getGameChannelSortIndex(channelName) {
  const normalized = getComparableName(channelName);
  const index = gameChannelOrderKeywords.findIndex((keyword) => normalized.includes(normalizeName(keyword)));
  return index === -1 ? gameChannelOrderKeywords.length : index;
}

function getCategoryChildren(guild, categoryId) {
  return [...guild.channels.cache.values()].filter((channel) => channel.parentId === categoryId);
}

async function sortGameCategory(category, summary) {
  const children = getCategoryChildren(category.guild, category.id)
    .filter((channel) => channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildVoice)
    .sort((a, b) => getGameChannelSortIndex(a.name) - getGameChannelSortIndex(b.name));

  for (let index = 0; index < children.length; index += 1) {
    try {
      await children[index].setPosition(index, { reason: 'Restore active game channel order' });
    } catch (error) {
      if (summary) summary.failed.push(`排序失敗：${children[index].name} (${error.message})`);
    }
  }
}

function findCategory(guild, categoryName) {
  return guild.channels.cache.find(
    (channel) => channel.type === ChannelType.GuildCategory && channel.name === categoryName
  ) || null;
}

async function getOrCreateCategory(guild, categoryName, summary) {
  const existing = findCategory(guild, categoryName);
  if (existing) return existing;

  const created = await guild.channels.create({
    name: categoryName,
    type: ChannelType.GuildCategory,
    reason: 'Restore active channel category'
  });
  if (summary) summary.createdCategories.push(categoryName);
  return created;
}

function buildRestoreActiveChannelsPlan(guild, options = {}) {
  const onlyArchived = options.onlyArchived !== false;
  const moves = [];
  const skipped = [];

  for (const channel of guild.channels.cache.values()) {
    if (channel.type === ChannelType.GuildCategory) continue;
    if (channel.name.startsWith('ticket-')) continue;

    const currentCategoryName = channel.parent?.name || '未分類';
    if (onlyArchived && !isArchiveCategoryName(currentCategoryName)) continue;

    const target = inferActiveChannelTarget(channel);
    if (!target) continue;
    if (currentCategoryName === target.categoryName) {
      skipped.push({ channelId: channel.id, channelName: channel.name, reason: '已在正確分類' });
      continue;
    }

    moves.push({
      channelId: channel.id,
      channelName: channel.name,
      currentCategoryName,
      targetCategoryName: target.categoryName,
      reason: target.reason
    });
  }

  return {
    guildId: guild.id,
    requestedById: options.requestedById,
    mode: options.mode || 'preview',
    createdAt: Date.now(),
    moves,
    skipped
  };
}

function saveRestoreActiveChannelsPlan(id, plan) {
  pendingRestoreActiveChannelPlans.set(id, plan);
}

function getRestoreActiveChannelsPlan(id) {
  return pendingRestoreActiveChannelPlans.get(id);
}

function deleteRestoreActiveChannelsPlan(id) {
  pendingRestoreActiveChannelPlans.delete(id);
}

async function executeRestoreActiveChannels(guild, plan) {
  const summary = {
    createdCategories: [],
    movedChannels: [],
    skipped: [],
    failed: []
  };
  const touchedCategories = new Set();

  for (const move of plan.moves) {
    const channel = guild.channels.cache.get(move.channelId);
    if (!channel) {
      summary.skipped.push(`${move.channelName}：頻道不存在`);
      continue;
    }
    if (channel.name.startsWith('ticket-')) {
      summary.skipped.push(`${channel.name}：ticket 頻道不處理`);
      continue;
    }

    try {
      const category = await getOrCreateCategory(guild, move.targetCategoryName, summary);
      if (channel.parentId === category.id) {
        summary.skipped.push(`${channel.name}：已在正確分類`);
        continue;
      }
      await channel.setParent(category.id, {
        lockPermissions: false,
        reason: 'Restore active channel from archive'
      });
      summary.movedChannels.push(`${channel.name} -> ${category.name}`);
      touchedCategories.add(category.id);
    } catch (error) {
      summary.failed.push(`${move.channelName}：${error.message}`);
    }
  }

  for (const categoryId of touchedCategories) {
    const category = guild.channels.cache.get(categoryId);
    if (category && category.name.startsWith('🎮｜')) await sortGameCategory(category, summary);
  }

  return summary;
}

module.exports = {
  ARCHIVE_CATEGORY,
  DAILY_LOBBY_CATEGORY,
  PUBLIC_LOBBY_CATEGORY,
  buildRestoreActiveChannelsPlan,
  deleteRestoreActiveChannelsPlan,
  executeRestoreActiveChannels,
  gamePrefixRules,
  getRestoreActiveChannelsPlan,
  hasProtectedChannelKeyword,
  inferActiveChannelTarget,
  isActiveProtectedChannel,
  isArchiveCategoryName,
  protectedChannelKeywords,
  saveRestoreActiveChannelsPlan,
  sortGameCategory
};
