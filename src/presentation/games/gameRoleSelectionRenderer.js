const { ActionRowBuilder, MessageFlags, StringSelectMenuBuilder } = require('discord.js');
const GAME_REGISTRY = require('../../domain/games/gameRegistry');
const { getGameRoleKey } = require('../../domain/games/gameAccessPolicy');

const GAME_ROLE_SELECTION_CUSTOM_ID = 'game_role_selection_menu';

function renderGameRoleSelector({ selectedGameIds = [], gameRegistry = GAME_REGISTRY } = {}) {
  if (gameRegistry.length > 25) return Object.freeze({ content: '目前遊戲清單超過 Discord selector 上限，尚未支援分頁選擇。', flags: MessageFlags.Ephemeral });
  const selected = new Set(selectedGameIds);
  const options = gameRegistry.map((game) => ({ label: game.displayName, value: game.id, emoji: game.emoji, default: selected.has(game.id) }));
  const menu = new StringSelectMenuBuilder().setCustomId(GAME_ROLE_SELECTION_CUSTOM_ID).setPlaceholder('選擇你玩的遊戲').setMinValues(0).setMaxValues(options.length).addOptions(options);
  return Object.freeze({ content: '🎯 選擇你玩的遊戲。取消勾選會移除對應遊戲身分組。', components: [new ActionRowBuilder().addComponents(menu)], flags: MessageFlags.Ephemeral });
}

function roleNames(roleKeys) {
  return roleKeys.map((roleKey) => { const game = GAME_REGISTRY.find((item) => getGameRoleKey(item.id) === roleKey); return game ? game.emoji + ' ' + game.displayName : roleKey; });
}

function renderGameRoleSelectionResult(result) {
  if (result.code === 'PARENT_GAME_ROLE_REQUIRED') return Object.freeze({ content: '請先選擇「🎮 遊戲玩家」。', flags: MessageFlags.Ephemeral });
  if (result.code === 'ROLE_NOT_PROVISIONED') return Object.freeze({ content: 'ROLE_NOT_PROVISIONED: ' + result.missingGameIds.join(', '), flags: MessageFlags.Ephemeral });
  if (result.code === 'UNKNOWN_GAME_ID') return Object.freeze({ content: 'UNKNOWN_GAME_ID: ' + result.unknownGameIds.join(', '), flags: MessageFlags.Ephemeral });
  if (!result.ok) return Object.freeze({ content: '更新遊戲身分組失敗：' + result.code, flags: MessageFlags.Ephemeral });
  if (!result.addedRoleKeys.length && !result.removedRoleKeys.length) return Object.freeze({ content: '沒有需要更新的遊戲身分組。', flags: MessageFlags.Ephemeral });
  const lines = ['✅ 已更新遊戲身分組'];
  if (result.addedRoleKeys.length) lines.push('已加入：' + roleNames(result.addedRoleKeys).join('、'));
  if (result.removedRoleKeys.length) lines.push('已移除：' + roleNames(result.removedRoleKeys).join('、'));
  if (result.unchangedRoleKeys.length) lines.push('保持：' + roleNames(result.unchangedRoleKeys).join('、'));
  return Object.freeze({ content: lines.join('\n'), flags: MessageFlags.Ephemeral });
}

module.exports = { GAME_ROLE_SELECTION_CUSTOM_ID, renderGameRoleSelector, renderGameRoleSelectionResult };
