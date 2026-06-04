const { EmbedBuilder } = require('discord.js');
const {
  buildCommunityArchitectPlan,
  getCommunityArchitectPlan,
  saveCommunityArchitectPlan,
  deleteCommunityArchitectPlan
} = require('./communityArchitectPlanner');
const { executeCommunityArchitectPlan } = require('./communityArchitectExecutor');

function lines(items, mapper, empty = '無') {
  const values = items.map(mapper).filter(Boolean);
  return values.length ? values.slice(0, 12).join('\n').slice(0, 1024) : empty;
}

function groupActions(actions = []) {
  return {
    rename: actions.filter((item) => item.type === 'rename'),
    move: actions.filter((item) => item.type === 'move'),
    archive: actions.filter((item) => item.type === 'merge_duplicate_game' || item.type === 'archive'),
    create: actions.filter((item) => item.type === 'create_category' || item.type === 'create_missing_channel'),
    createMain: actions.filter((item) => item.phase === 'create_main_category'),
    gameChildRename: actions.filter((item) => item.type === 'rename' && item.classification === 'dynamic_game'),
    gameCategoryMove: actions.filter((item) => item.type === 'reorder_category'),
    interestMove: actions.filter((item) => item.type === 'move' && item.targetCategoryName === '🎨｜興趣交流'),
    restoreNames: actions.filter((item) => item.type === 'restore_duplicate_game_name'),
    permission: actions.filter((item) => item.type === 'sync_permission'),
    metadata: actions.filter((item) => item.type === 'repair_metadata' || item.type === 'repair_create_entry'),
    reorder: actions.filter((item) => item.type === 'reorder_category'),
    suggest: actions.filter((item) => item.type === 'suggest'),
    highRisk: actions.filter((item) => item.risk === 'high')
  };
}

function buildDiagnoseEmbed(plan) {
  return new EmbedBuilder()
    .setColor(plan.healthScore >= 80 ? 0x57f287 : plan.healthScore >= 60 ? 0xf2c94c : 0xeb5757)
    .setTitle('🏗️ Community Architect Report')
    .setDescription([
      `社群健康度：${plan.healthScore} / 100`,
      `scope: ${plan.scope}`,
      `strategy: ${plan.strategy}`,
      `AI: ${plan.aiUsed ? '已參與社群診斷' : '未使用或未設定 OPENAI_API_KEY'}`
    ].join('\n'))
    .addFields(
      { name: '健康分項', value: Object.entries(plan.healthSections).map(([key, value]) => `${key}: ${value}/20`).join('\n'), inline: false },
      { name: '問題摘要', value: lines(plan.issues, (item) => `- ${item}`), inline: false },
      { name: '建議', value: lines(plan.suggestions, (item) => `- ${item}`), inline: false },
      { name: 'AI Notes', value: lines(plan.aiNotes || [], (item) => `- ${item}`), inline: false }
    )
    .setTimestamp();
}

function buildPreviewEmbed(plan) {
  const groups = groupActions(plan.actions);
  return new EmbedBuilder()
    .setColor(groups.highRisk.length ? 0xeb5757 : 0x5865f2)
    .setTitle('🏗️ Community Architect Repair Plan')
    .setDescription([
      `planId: ${plan.planId}`,
      `社群健康度：${plan.healthScore} / 100`,
      `scope: ${plan.scope}`,
      `strategy: ${plan.strategy}`,
      'Community Architect v1 不會直接刪除頻道，只允許封存。'
    ].join('\n'))
    .addFields(
      { name: '將建立主分類', value: lines(groups.createMain, (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '將修正遊戲子頻道', value: lines(groups.gameChildRename, (item) => `${item.targetName} → ${item.newName}`), inline: false },
      { name: '將移動遊戲分類', value: lines(groups.gameCategoryMove, (item) => `${item.targetName} → ${item.targetCategoryName}`), inline: false },
      { name: '將移動興趣頻道', value: lines(groups.interestMove, (item) => `${item.targetName} → ${item.targetCategoryName}`), inline: false },
      { name: '將封存重複遊戲', value: lines(groups.archive, (item) => `${item.targetName} → ${item.targetCategoryName}\n原因：${item.reason}`), inline: false },
      { name: '將修正 duplicate-game 名稱', value: lines(groups.restoreNames, (item) => `${item.targetName} → ${item.newName}`), inline: false },
      { name: '將修權限', value: lines(groups.permission, (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '將修 metadata', value: lines(groups.metadata, (item) => `${item.targetName || item.categoryName} - ${item.reason}`), inline: false },
      { name: '將建立其他項目', value: lines(groups.create.filter((item) => item.phase !== 'create_main_category'), (item) => `${item.targetName} - ${item.reason}`), inline: false },
      { name: '規則降級為建議', value: lines(groups.suggest, (item) => `${item.targetName}: ${item.reason}`), inline: false },
      { name: '高風險', value: lines(groups.highRisk, (item) => `${item.type}: ${item.targetName}`), inline: false }
    )
    .setTimestamp();
}

module.exports = {
  buildCommunityArchitectPlan,
  buildDiagnoseEmbed,
  buildPreviewEmbed,
  deleteCommunityArchitectPlan,
  executeCommunityArchitectPlan,
  getCommunityArchitectPlan,
  saveCommunityArchitectPlan
};
