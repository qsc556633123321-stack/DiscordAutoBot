const { ChannelType, EmbedBuilder } = require('discord.js');
const architecture = require('../domain/community/communityArchitectureV3');
const { isSameGame, stripGameCategoryPrefix } = require('../domain/games/gameIdentityService');

const pendingCategoryCleanupPlans = new Map();

const PROTECTED_CATEGORIES = new Set(architecture.categories.map((category) => category.name));

const OLD_CATEGORY_PATTERN = /^(文字頻道|語音頻道|資訊中心|玩家大廳|遊戲專區|uncategorized|舊分類|old-category|empty-category|重複管理員後台|📦｜待刪除分類-.+)$/i;

function getCategoryChildren(guild, categoryId) {
  return [...guild.channels.cache.values()].filter((channel) => channel.parentId === categoryId);
}

function isProtectedCategory(guild, category) {
  if (!category?.name) return true;
  if (PROTECTED_CATEGORIES.has(category.name)) return true;
  const children = getCategoryChildren(guild, category.id);
  return children.some((channel) => channel?.name?.startsWith('ticket-'));
}

function normalizeName(name = '') {
  return String(name || '').normalize('NFKC').toLowerCase().replace(/[^\p{Letter}\p{Number}]+/gu, '');
}

function isProtectedChannel(guild, channel) {
  if (!channel?.name) return true;
  if ([guild.systemChannelId, guild.rulesChannelId, guild.publicUpdatesChannelId].includes(channel.id)) return true;
  return channel.name.startsWith('ticket-') ||
    /server-logs|ticket-logs|bot-control|目前語音房|組隊招募|遊戲提議|建立語音/i.test(channel.name);
}

function duplicateCategoryIds(categories) {
  const duplicates = new Set();
  for (let index = 0; index < categories.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < categories.length; otherIndex += 1) {
      const left = categories[index];
      const right = categories[otherIndex];
      const sameName = normalizeName(left.name) === normalizeName(right.name);
      const sameGame = left.name?.startsWith('🎮') && right.name?.startsWith('🎮') &&
        isSameGame(stripGameCategoryPrefix(left.name), stripGameCategoryPrefix(right.name));
      if (!sameName && !sameGame) continue;
      const keep = isProtectedCategory(left.guild, left) ? left : right;
      duplicates.add(keep.id === left.id ? right.id : left.id);
    }
  }
  return duplicates;
}

function isGameCategory(category) {
  return Boolean(category?.name?.startsWith('🎮'));
}

function analyzeOrphanChannels(guild) {
  return [...guild.channels.cache.values()]
    .filter((channel) => channel.type !== ChannelType.GuildCategory)
    .filter((channel) => {
      if (isProtectedChannel(guild, channel)) return false;
      if (!channel.parentId) return true;
      return !guild.channels.cache.has(channel.parentId);
    })
    .map((channel) => ({
      channelId: channel.id,
      channelName: channel.name,
      reason: channel.parentId ? 'parent category 不存在' : '沒有 parent category',
      action: '刪除'
    }));
}

function isArchivedChild(channel) {
  return /^delete-pending-|old-|archive-|📦|封存|待刪除/i.test(channel?.name || '');
}

function isTempVoiceChild(channel) {
  return channel?.type === ChannelType.GuildVoice && /^🔊｜/.test(channel?.name || '');
}

function analyzeEmptyCategories(guild, options = {}) {
  const deleteLevel = options.deleteLevel || 'safe';
  const categories = [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildCategory);
  const duplicateIds = duplicateCategoryIds(categories);

  return categories.map((category) => {
    const children = getCategoryChildren(guild, category.id);
    const protectedCategory = isProtectedCategory(guild, category);
    const oldCategory = OLD_CATEGORY_PATTERN.test(category.name);
    const onlyIgnoredChildren = children.length > 0 &&
      children.every((child) => isArchivedChild(child) || isTempVoiceChild(child));
    const empty = children.length === 0;
    const duplicate = duplicateIds.has(category.id);
    const legacy = !protectedCategory && !isGameCategory(category);
    const candidate = !protectedCategory && (empty || duplicate || legacy);
    let action = '保留';

    if (candidate) action = '刪除';

    return {
      categoryId: category.id,
      categoryName: category.name,
      childCount: children.length,
      protectedCategory,
      oldCategory,
      empty,
      onlyIgnoredChildren,
      duplicate,
      legacy,
      candidate,
      action
    };
  });
}

function createCategoryCleanupPlan(guild, options = {}) {
  return {
    guildId: guild.id,
    requestedById: options.requestedById,
    mode: options.mode || 'preview',
    deleteLevel: options.deleteLevel || 'safe',
    createdAt: Date.now(),
    items: analyzeEmptyCategories(guild, options),
    orphanChannels: analyzeOrphanChannels(guild)
  };
}

function saveCategoryCleanupPlan(id, plan) {
  pendingCategoryCleanupPlans.set(id, plan);
}

function getCategoryCleanupPlan(id) {
  return pendingCategoryCleanupPlans.get(id);
}

function deleteCategoryCleanupPlan(id) {
  pendingCategoryCleanupPlans.delete(id);
}

async function executeCategoryCleanup(guild, plan) {
  const renamed = [];
  const deleted = [];
  const skipped = [];
  const failed = [];

  for (const item of plan.items.filter((entry) => entry.candidate)) {
    const category = guild.channels.cache.get(item.categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) continue;

    const children = getCategoryChildren(guild, category.id);
    if (isProtectedCategory(guild, category)) {
      skipped.push(`${category.name}：保護分類`);
      continue;
    }

    try {
      if (children.length > 0 && !item.duplicate && !item.legacy) {
        skipped.push(`${category.name}：仍有子頻道`);
        continue;
      }
      if (item.duplicate || item.legacy) {
        for (const child of children) {
          if (isProtectedChannel(guild, child)) {
            skipped.push(`${category.name}：包含保護頻道 ${child.name}`);
            continue;
          }
          await child.delete('Community V4 Lite duplicate category cleanup');
          deleted.push(child.name);
        }
        if (getCategoryChildren(guild, category.id).some((child) => isProtectedChannel(guild, child))) {
          skipped.push(`${category.name}：保護頻道尚未清空`);
          continue;
        }
      }

      await category.delete('Community V4 Lite empty or duplicate category cleanup');
      deleted.push(item.categoryName);
    } catch (error) {
      console.error(`清理空分類 ${item.categoryName} 失敗:`, error);
      failed.push(`${item.categoryName}：${error.message}`);
    }
  }

  for (const item of plan.orphanChannels || []) {
    const channel = guild.channels.cache.get(item.channelId);
    if (!channel || isProtectedChannel(guild, channel)) {
      skipped.push(`${item.channelName}：不存在或受保護`);
      continue;
    }
    try {
      await channel.delete(`Community V4 Lite orphan cleanup: ${item.reason}`);
      deleted.push(item.channelName);
    } catch (error) {
      failed.push(`${item.channelName}：${error.message}`);
    }
  }

  return { renamed, deleted, skipped, failed };
}

async function cleanupEmptyCategories(guild, options = {}) {
  const plan = createCategoryCleanupPlan(guild, {
    ...options,
    mode: 'execute',
    deleteLevel: options.deleteLevel || 'safe'
  });
  return executeCategoryCleanup(guild, plan);
}

function buildCategoryCleanupEmbed(plan) {
  const lines = plan.items.map((item) => (
    `• ${item.categoryName}｜子頻道：${item.childCount}｜保護：${item.protectedCategory ? '是' : '否'}｜建議：${item.action}`
  )).concat((plan.orphanChannels || []).map((item) => `• ${item.channelName}｜${item.reason}｜建議：刪除`));

  return new EmbedBuilder()
    .setColor(0x2f80ed)
    .setTitle('空分類清理預覽')
    .setDescription('preview 不會修改伺服器；execute 需要確認後才會處理。')
    .addFields({
      name: '分類檢查結果',
      value: (lines.join('\n') || '沒有分類').slice(0, 1024)
    })
    .setTimestamp();
}

module.exports = {
  buildCategoryCleanupEmbed,
  cleanupEmptyCategories,
  createCategoryCleanupPlan,
  deleteCategoryCleanupPlan,
  executeCategoryCleanup,
  getCategoryCleanupPlan,
  saveCategoryCleanupPlan,
  analyzeOrphanChannels
};
