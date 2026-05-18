const { ChannelType, EmbedBuilder } = require('discord.js');

const pendingCategoryCleanupPlans = new Map();

const PROTECTED_CATEGORIES = new Set([
  '📌｜社群入口',
  '💬｜日常交流',
  '💬｜日常大廳',
  '🎮｜APEX',
  '🎮｜特戰英豪',
  '🎮｜Minecraft',
  '🎮｜LOL',
  '🎮｜遊戲大廳',
  '🔊｜遊戲語音',
  '🎉｜活動專區',
  '🎫｜客服支援',
  '🔒｜管理員後台',
  '📦｜舊頻道封存'
]);

const OLD_CATEGORY_PATTERN = /^(文字頻道|語音頻道|uncategorized|舊分類|old-category|empty-category|📌｜資訊中心|💬｜玩家大廳|🎮｜遊戲專區)$/i;

function getCategoryChildren(guild, categoryId) {
  return [...guild.channels.cache.values()].filter((channel) => channel.parentId === categoryId);
}

function isProtectedCategory(guild, category) {
  if (PROTECTED_CATEGORIES.has(category.name)) return true;
  if (/ticket|客服/i.test(category.name)) return true;

  const children = getCategoryChildren(guild, category.id);
  return children.some((channel) => channel.name.startsWith('ticket-'));
}

function isArchivedChild(channel) {
  return /^delete-pending-|舊|old|archive|封存/i.test(channel.name);
}

function isTempVoiceChild(channel) {
  return channel.type === ChannelType.GuildVoice && /^🔊｜/.test(channel.name);
}

function analyzeEmptyCategories(guild, options = {}) {
  const deleteLevel = options.deleteLevel || 'safe';
  const categories = [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildCategory);

  return categories.map((category) => {
    const children = getCategoryChildren(guild, category.id);
    const protectedCategory = isProtectedCategory(guild, category);
    const oldCategory = OLD_CATEGORY_PATTERN.test(category.name);
    const onlyIgnoredChildren = children.length > 0 &&
      children.every((child) => isArchivedChild(child) || isTempVoiceChild(child));
    const empty = children.length === 0;
    const candidate = !protectedCategory && oldCategory && (empty || onlyIgnoredChildren);
    let action = '保留';

    if (candidate && deleteLevel === 'safe') action = '封存';
    if (candidate && deleteLevel !== 'safe' && empty) action = '刪除';
    if (candidate && deleteLevel !== 'safe' && !empty) action = '封存';

    return {
      categoryId: category.id,
      categoryName: category.name,
      childCount: children.length,
      protectedCategory,
      oldCategory,
      empty,
      onlyIgnoredChildren,
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
    items: analyzeEmptyCategories(guild, options)
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
      if (plan.deleteLevel === 'safe' || children.length > 0) {
        const nextName = `📦｜待刪除分類-${category.name}`.slice(0, 90);
        if (category.name !== nextName) await category.setName(nextName, 'Safe empty category cleanup');
        renamed.push(`${item.categoryName} -> ${nextName}`);
        continue;
      }

      await category.delete('Empty old category cleanup');
      deleted.push(item.categoryName);
    } catch (error) {
      console.error(`清理空分類 ${item.categoryName} 失敗：`, error);
      failed.push(`${item.categoryName}：${error.message}`);
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
  ));

  return new EmbedBuilder()
    .setColor(0x2f80ed)
    .setTitle('空分類清理預覽')
    .setDescription('只會清理符合舊分類名稱且非保護分類的項目。含子頻道的分類不會被直接刪除。')
    .addFields({
      name: '掃描結果',
      value: (lines.join('\n') || '沒有分類。').slice(0, 1024)
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
  saveCategoryCleanupPlan
};
