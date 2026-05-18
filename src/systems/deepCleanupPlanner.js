const { ChannelType } = require('discord.js');
const { DEFAULT_GAMES, inferGameCategoryName, isCreateVoiceChannel } = require('./gameChannels');
const { isTempVoice } = require('./tempVoice');

const MAX_MOVE_COUNT = 30;
const MAX_DELETE_COUNT = 5;
const ARCHIVE_CATEGORY = '📦｜封存區';
const pendingDeepCleanupPlans = new Map();

const TARGET_CATEGORIES = [
  '📌｜社群入口',
  '💬｜日常大廳',
  '🎮｜遊戲大廳',
  '🔊｜遊戲語音',
  ...DEFAULT_GAMES.map((game) => game.categoryName),
  '🎫｜客服支援',
  '🔒｜管理員後台',
  '🎉｜活動專區',
  ARCHIVE_CATEGORY
];

function normalizeName(name) {
  return name.toLowerCase().replace(/[\s_\-｜|#🎫🎟📑📌💬🎮🔊🔒🎉📦]+/g, '');
}

function isTextLike(channel) {
  return [
    ChannelType.GuildText,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum
  ].includes(channel.type);
}

function isVoiceLike(channel) {
  return [
    ChannelType.GuildVoice,
    ChannelType.GuildStageVoice
  ].includes(channel.type);
}

function isProtectedChannel(channel, sourceChannelId) {
  if (channel.id === sourceChannelId) return '正在執行指令的頻道';
  if (channel.name.startsWith('ticket-')) return '私人客服單';
  if (isCreateVoiceChannel(channel)) return '建立臨時語音入口';
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return 'Bot 建立的臨時語音，由 tempVoice 系統管理';
  return null;
}

function hasPrivatePermissions(channel) {
  return channel.permissionOverwrites.cache.some((overwrite) => (
    overwrite.deny.has('ViewChannel') || overwrite.allow.has('ManageChannels')
  ));
}

function inferTargetCategory(channel) {
  const normalized = normalizeName(channel.name);

  if (/ticketlogs|serverlogs|管理員頻道|管理|後台|log|logs|紀錄|審核/.test(normalized)) return ['🔒｜管理員後台', '管理或紀錄頻道'];
  if (/客服|支援|回報|問題|開啟客服單|ticket/.test(normalized)) return ['🎫｜客服支援', '客服支援頻道'];

  const gameCategoryName = inferGameCategoryName(channel);
  if (gameCategoryName) return [gameCategoryName, '命中遊戲專屬分區'];

  if (isVoiceLike(channel)) {
    return ['🔊｜遊戲語音', '語音頻道優先歸入遊戲語音'];
  }

  if (/活動規劃|活動公告|投票區|活動|賽事|抽獎|投票/.test(normalized)) return ['🎉｜活動專區', '活動相關頻道'];
  if (/規則|公告|驗證區|驗證|身分組|身分|新人報到|說明/.test(normalized)) return ['📌｜社群入口', '社群入口資訊頻道'];
  if (/美食分享|好圖分享|一般聊天|私人限定討論區|閒聊|聊天/.test(normalized)) return ['💬｜日常大廳', '日常聊天與分享頻道'];
  if (/找隊友|戰績分享|戰績|遊戲討論/.test(normalized)) return ['🎮｜遊戲大廳', '遊戲文字討論頻道'];

  if (/私人限定討論區/.test(normalized)) {
    return [hasPrivatePermissions(channel) ? '🔒｜管理員後台' : '💬｜日常大廳', '私人限定討論區依權限判斷'];
  }

  if (/討論區/.test(normalized)) {
    return [isVoiceLike(channel) ? '🔊｜遊戲語音' : '💬｜日常大廳', '模糊討論區依頻道類型歸類'];
  }

  return [null, '未命中深度整理規則'];
}

function isOldOrLowActivity(channel) {
  const now = Date.now();
  const createdAt = channel.createdTimestamp || now;
  const olderThan180Days = now - createdAt > 180 * 24 * 60 * 60 * 1000;
  return olderThan180Days && !channel.lastMessageId;
}

function isBlankChannel(channel) {
  return /^[-_\s]*$/.test(channel.name) || /^(文字頻道|語音頻道|newchannel|new-channel)$/i.test(channel.name);
}

function findDuplicateGroups(channels) {
  const groups = new Map();

  for (const channel of channels) {
    const key = normalizeName(channel.name);
    if (!key) continue;
    const group = groups.get(key) || [];
    group.push(channel);
    groups.set(key, group);
  }

  return [...groups.values()].filter((group) => group.length > 1);
}

function chooseDuplicateKeeper(group) {
  return [...group].sort((a, b) => {
    const aHasMessage = a.lastMessageId ? 1 : 0;
    const bHasMessage = b.lastMessageId ? 1 : 0;
    if (aHasMessage !== bHasMessage) return bHasMessage - aHasMessage;
    return (b.createdTimestamp || 0) - (a.createdTimestamp || 0);
  })[0];
}

function shouldSuggestDelete(channel, deleteLevel, duplicateReason) {
  if (deleteLevel === 'safe') return false;
  if (deleteLevel === 'normal') return Boolean(duplicateReason) || isBlankChannel(channel);
  if (deleteLevel === 'aggressive') return Boolean(duplicateReason) || isBlankChannel(channel) || isOldOrLowActivity(channel);
  return false;
}

function pushUniqueMove(moves, item) {
  if (moves.some((move) => move.channelId === item.channelId)) return;
  if (moves.length >= MAX_MOVE_COUNT) return;
  moves.push(item);
}

function pushUniqueDelete(deleteSuggestions, item) {
  if (deleteSuggestions.some((deleteItem) => deleteItem.channelId === item.channelId)) return;
  if (deleteSuggestions.length >= MAX_DELETE_COUNT) return;
  deleteSuggestions.push(item);
}

function createDeepCleanupPlan(guild, { mode, deleteLevel, useAi, sourceChannelId, requestedById }) {
  const channels = [...guild.channels.cache.values()];
  const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
  const categoryNames = new Set(categories.map((category) => category.name));
  const manageableChannels = channels.filter((channel) => isTextLike(channel) || isVoiceLike(channel));
  const categoriesToCreate = TARGET_CATEGORIES.filter((category) => !categoryNames.has(category));
  const moves = [];
  const archives = [];
  const deleteSuggestions = [];
  const protectedChannels = [];
  const oldDefaultCategories = categories.filter((category) => (
    ['文字頻道', '語音頻道', '📌｜資訊中心', '💬｜玩家大廳', '🎮｜遊戲專區'].includes(category.name)
  ));

  for (const channel of manageableChannels) {
    const protectedReason = isProtectedChannel(channel, sourceChannelId);
    if (protectedReason) {
      protectedChannels.push({ channelId: channel.id, channelName: channel.name, reason: protectedReason });
      continue;
    }

    const [targetCategoryName, reason] = inferTargetCategory(channel);
    if (!targetCategoryName) {
      if (isOldOrLowActivity(channel)) {
        archives.push({
          channelId: channel.id,
          channelName: channel.name,
          currentCategoryName: channel.parent ? channel.parent.name : '無分類',
          targetCategoryName: ARCHIVE_CATEGORY,
          reason: '舊頻道或低活躍，先封存不刪除'
        });
      }
      continue;
    }

    if (channel.parent && channel.parent.name === targetCategoryName) continue;

    pushUniqueMove(moves, {
      channelId: channel.id,
      channelName: channel.name,
      currentCategoryName: channel.parent ? channel.parent.name : '無分類',
      targetCategoryName,
      reason
    });
  }

  for (const group of findDuplicateGroups(manageableChannels)) {
    const keeper = chooseDuplicateKeeper(group);
    for (const channel of group) {
      if (channel.id === keeper.id) continue;
      const protectedReason = isProtectedChannel(channel, sourceChannelId);
      if (protectedReason) continue;

      const archiveItem = {
        channelId: channel.id,
        channelName: channel.name,
        currentCategoryName: channel.parent ? channel.parent.name : '無分類',
        targetCategoryName: ARCHIVE_CATEGORY,
        reason: `與 #${keeper.name} 功能或名稱重複，先封存`
      };
      archives.push(archiveItem);

      if (shouldSuggestDelete(channel, deleteLevel, true)) {
        pushUniqueDelete(deleteSuggestions, {
          channelId: channel.id,
          channelName: channel.name,
          reason: deleteLevel === 'aggressive' ? '低活躍且重複，允許建議刪除' : '明確重複頻道'
        });
      }
    }
  }

  for (const channel of manageableChannels) {
    if (deleteSuggestions.length >= MAX_DELETE_COUNT) break;
    const protectedReason = isProtectedChannel(channel, sourceChannelId);
    if (protectedReason) continue;
    if (!shouldSuggestDelete(channel, deleteLevel, false)) continue;

    pushUniqueDelete(deleteSuggestions, {
      channelId: channel.id,
      channelName: channel.name,
      reason: isBlankChannel(channel) ? '空白或預設名稱頻道' : '低活躍舊頻道'
    });
  }

  for (const category of oldDefaultCategories) {
    protectedChannels.push({
      channelId: category.id,
      channelName: category.name,
      reason: '舊分類若清空後建議封存或刪除；本指令只放入預覽，不直接刪除分類'
    });
  }

  const riskNotes = [
    '執行前必須按下二次確認按鈕。',
    '刪除前會先改名為 delete-pending-原頻道名，等待 5 秒後才刪除。',
    `本次最多搬移 ${MAX_MOVE_COUNT} 個頻道、最多刪除 ${MAX_DELETE_COUNT} 個頻道。`,
    'ticket- 開頭私人客服單與執行指令所在頻道受到保護。'
  ];

  if (useAi) {
    riskNotes.push('use_ai 已開啟；深度整理仍只會在二次確認後執行本預覽列出的安全動作。');
  }

  return {
    guildId: guild.id,
    requestedById,
    sourceChannelId,
    mode,
    deleteLevel,
    useAi,
    createdAt: Date.now(),
    categoriesToCreate: [...new Set([...categoriesToCreate, ARCHIVE_CATEGORY])].filter((name) => !categoryNames.has(name)),
    moves: moves.slice(0, MAX_MOVE_COUNT),
    archives: archives
      .filter((item, index, array) => array.findIndex((target) => target.channelId === item.channelId) === index)
      .slice(0, MAX_MOVE_COUNT),
    deleteSuggestions,
    protectedChannels,
    riskNotes
  };
}

function saveDeepCleanupPlan(id, plan) {
  pendingDeepCleanupPlans.set(id, plan);
}

function getDeepCleanupPlan(id) {
  return pendingDeepCleanupPlans.get(id);
}

function deleteDeepCleanupPlan(id) {
  pendingDeepCleanupPlans.delete(id);
}

module.exports = {
  ARCHIVE_CATEGORY,
  MAX_DELETE_COUNT,
  MAX_MOVE_COUNT,
  createDeepCleanupPlan,
  deleteDeepCleanupPlan,
  getDeepCleanupPlan,
  pendingDeepCleanupPlans,
  saveDeepCleanupPlan
};
