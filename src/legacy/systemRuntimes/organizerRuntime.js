const { ChannelType } = require('discord.js');
const { listChannelRules } = require('../../systems/serverMemory');
const { inferGameCategoryName, isCreateVoiceChannel } = require('../../systems/gameChannels');
const { isTempVoice } = require('../../systems/tempVoice');

const MAX_MOVES_PER_PLAN = 20;
const MIN_MOVE_SCORE = 5;
const MIN_MOVE_GAP = 2;
const ADMIN_AREA_STRICT_SCORE = 8;
const ADMIN_AREA_STRICT_GAP = 4;
const pendingOrganizePlans = new Map();

const CATEGORY_RULES = [
  {
    categoryName: '📌｜社群入口',
    keywords: [
      { text: '規則', weight: 5 },
      { text: '公告', weight: 5 },
      { text: '驗證', weight: 4 },
      { text: '身分', weight: 3 },
      { text: '身分組', weight: 4 },
      { text: '新人報到', weight: 4 },
      { text: '說明', weight: 2 }
    ]
  },
  {
    categoryName: '💬｜日常大廳',
    keywords: [
      { text: '一般聊天', weight: 5 },
      { text: '聊天', weight: 5 },
      { text: '閒聊', weight: 5 },
      { text: '美食分享', weight: 5 },
      { text: '好圖分享', weight: 5 },
      { text: '私人限定討論區', weight: 5 }
    ]
  },
  {
    categoryName: '🎮｜遊戲大廳',
    keywords: [
      { text: '找隊友', weight: 5 },
      { text: '戰績', weight: 3 },
      { text: '戰績分享', weight: 5 },
      { text: '遊戲討論', weight: 5 }
    ]
  },
  {
    categoryName: '🔊｜遊戲語音',
    keywords: [
      { text: 'apex', weight: 5 },
      { text: '特戰', weight: 5 },
      { text: 'lol', weight: 5 },
      { text: 'minecraft', weight: 5 },
      { text: '掛機睡覺', weight: 5 },
      { text: '語音', weight: 4 },
      { text: '討論區', weight: 3 }
    ]
  },
  {
    categoryName: '🔒｜管理員後台',
    keywords: [
      { text: '管理', weight: 5 },
      { text: 'log', weight: 5 },
      { text: 'logs', weight: 5 },
      { text: '紀錄', weight: 4 },
      { text: '審核', weight: 4 },
      { text: '後台', weight: 5 }
    ]
  },
  {
    categoryName: '🎫｜客服支援',
    keywords: [
      { text: 'ticket', weight: 5 },
      { text: '客服', weight: 5 },
      { text: '支援', weight: 4 },
      { text: '回報', weight: 4 },
      { text: '問題', weight: 3 }
    ]
  },
  {
    categoryName: '📈｜投資討論區',
    keywords: [
      { text: '股票', weight: 5 },
      { text: '投資', weight: 5 },
      { text: '台股', weight: 5 },
      { text: '盤勢', weight: 4 },
      { text: 'AI分析', weight: 3 }
    ]
  },
  {
    categoryName: '🛠｜開發專區',
    keywords: [
      { text: '專案', weight: 5 },
      { text: '開發', weight: 5 },
      { text: 'api', weight: 4 },
      { text: '程式', weight: 4 },
      { text: 'github', weight: 4 },
      { text: 'codex', weight: 4 }
    ]
  },
  {
    categoryName: '🎉｜活動專區',
    keywords: [
      { text: '活動規劃', weight: 6 },
      { text: '活動公告', weight: 6 },
      { text: '投票區', weight: 6 },
      { text: '活動', weight: 5 },
      { text: '賽事', weight: 5 },
      { text: '抽獎', weight: 4 },
      { text: '投票', weight: 4 }
    ]
  }
];

function normalizeName(name) {
  return name.toLowerCase().replace(/[\s_\-｜|#]+/g, '');
}

function scoreChannelName(channelName, memoryRules = []) {
  const normalized = normalizeName(channelName);
  const categoryScores = new Map();

  for (const rule of CATEGORY_RULES) {
    categoryScores.set(rule.categoryName, {
      categoryName: rule.categoryName,
      score: 0,
      matches: []
    });
  }

  for (const rule of CATEGORY_RULES) {
    const current = categoryScores.get(rule.categoryName);

    for (const keyword of rule.keywords) {
      if (normalized.includes(normalizeName(keyword.text))) {
        current.score += keyword.weight;
        current.matches.push(`${keyword.text}+${keyword.weight}`);
      }
    }
  }

  for (const memoryRule of memoryRules) {
    if (!memoryRule.keyword || !memoryRule.category) continue;
    if (!normalized.includes(normalizeName(memoryRule.keyword))) continue;

    const weight = Number(memoryRule.weight) || 5;
    const current = categoryScores.get(memoryRule.category) || {
      categoryName: memoryRule.category,
      score: 0,
      matches: []
    };

    current.score += weight;
    current.matches.push(`命中伺服器記憶：${memoryRule.keyword} +${weight}`);
    categoryScores.set(memoryRule.category, current);
  }

  const scores = [...categoryScores.values()].sort((a, b) => b.score - a.score);

  const top = scores[0] || { score: 0, categoryName: '無', matches: [] };
  const second = scores[1] || { score: 0, categoryName: '無', matches: [] };
  const gap = top.score - second.score;

  return {
    top,
    second,
    gap,
    scores
  };
}

function isVoiceLike(channel) {
  return [ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type);
}

function applyChannelTypePriority(channel, result) {
  const gameCategoryName = inferGameCategoryName(channel);
  if (gameCategoryName) {
    const scores = result.scores.map((score) => ({ ...score, matches: [...score.matches] }));
    let gameScore = scores.find((score) => score.categoryName === gameCategoryName);
    if (!gameScore) {
      gameScore = { categoryName: gameCategoryName, score: 0, matches: [] };
      scores.push(gameScore);
    }
    gameScore.score += 8;
    gameScore.matches.push(`遊戲分區：${gameCategoryName} +8`);
    scores.sort((a, b) => b.score - a.score);
    result = {
      top: scores[0],
      second: scores[1] || { score: 0, categoryName: '無', matches: [] },
      gap: scores[0].score - (scores[1] ? scores[1].score : 0),
      scores
    };
  }

  if (!isVoiceLike(channel)) return result;

  const normalized = normalizeName(channel.name);
  if (/管理|後台|admin|mod|客服|支援|ticket/.test(normalized)) return result;
  if (gameCategoryName) return result;

  const scores = result.scores.map((score) => ({ ...score, matches: [...score.matches] }));
  let voiceScore = scores.find((score) => score.categoryName === '🔊｜遊戲語音');
  if (!voiceScore) {
    voiceScore = { categoryName: '🔊｜遊戲語音', score: 0, matches: [] };
    scores.push(voiceScore);
  }

  voiceScore.score += 6;
  voiceScore.matches.push('語音頻道優先：遊戲語音 +6');
  scores.sort((a, b) => b.score - a.score);

  return {
    top: scores[0],
    second: scores[1] || { score: 0, categoryName: '無', matches: [] },
    gap: scores[0].score - (scores[1] ? scores[1].score : 0),
    scores
  };
}

function getGuildMemoryRules(guildId) {
  try {
    return listChannelRules(guildId);
  } catch (error) {
    console.error('讀取伺服器記憶失敗，略過記憶加分：', error);
    return [];
  }
}

function getConfidence(topScore, gap) {
  if (topScore >= 8 && gap >= 4) return '高';
  if (topScore >= MIN_MOVE_SCORE && gap >= MIN_MOVE_GAP) return '中';
  if (topScore > 0) return '低';
  return '不確定';
}

function getManualReason(topScore, gap, confidence) {
  if (topScore < MIN_MOVE_SCORE) return `最高分 ${topScore} 未達 ${MIN_MOVE_SCORE}`;
  if (gap < MIN_MOVE_GAP) return `最高分與第二高分差距 ${gap} 未達 ${MIN_MOVE_GAP}`;
  if (confidence === '低') return '信心為低';
  return '不確定，建議人工判斷';
}

function isAdminArea(channel) {
  return Boolean(channel.parent && /管理|後台|admin|log|logs|紀錄|審核/i.test(channel.parent.name));
}

function isMovableChannel(channel, sourceChannelId) {
  const movableTypes = new Set([
    ChannelType.GuildText,
    ChannelType.GuildVoice,
    ChannelType.GuildAnnouncement,
    ChannelType.GuildForum,
    ChannelType.GuildStageVoice
  ]);

  if (!movableTypes.has(channel.type)) return false;
  if (channel.id === sourceChannelId) return false;
  if (channel.name.startsWith('ticket-')) return false;
  if (isCreateVoiceChannel(channel)) return false;
  if (channel.guild && isTempVoice(channel.guild.id, channel.id)) return false;

  return true;
}

function buildAnalysis(channel, memoryRules) {
  const result = applyChannelTypePriority(channel, scoreChannelName(channel.name, memoryRules));
  const confidence = getConfidence(result.top.score, result.gap);
  const matchedKeywords = result.top.matches.length ? result.top.matches.join('、') : '無';

  return {
    suggestedCategoryName: result.top.categoryName,
    topScore: result.top.score,
    secondScore: result.second.score,
    scoreGap: result.gap,
    confidence,
    reason: `命中 ${matchedKeywords}，第二高分：${result.second.categoryName} ${result.second.score} 分`
  };
}

function createOrganizePlan(guild, sourceChannelId, requestedById) {
  const channels = [...guild.channels.cache.values()];
  const categories = channels.filter((channel) => channel.type === ChannelType.GuildCategory);
  const categoryNames = new Set(categories.map((category) => category.name));
  const memoryRules = getGuildMemoryRules(guild.id);
  const moves = [];
  const manualReview = [];
  const categoriesToCreate = new Set();

  for (const channel of channels) {
    if (!isMovableChannel(channel, sourceChannelId)) continue;

    const analysis = buildAnalysis(channel, memoryRules);
    const currentCategoryName = channel.parent ? channel.parent.name : '無分類';
    const baseItem = {
      channelId: channel.id,
      channelName: channel.name,
      currentCategoryName,
      suggestedCategoryName: analysis.suggestedCategoryName,
      score: analysis.topScore,
      secondScore: analysis.secondScore,
      scoreGap: analysis.scoreGap,
      confidence: analysis.confidence,
      reason: analysis.reason
    };

    if (analysis.topScore === 0) continue;

    if (channel.parent && channel.parent.name === analysis.suggestedCategoryName) {
      continue;
    }

    if (
      isAdminArea(channel) &&
      !(analysis.topScore >= ADMIN_AREA_STRICT_SCORE && analysis.scoreGap >= ADMIN_AREA_STRICT_GAP)
    ) {
      manualReview.push({
        ...baseItem,
        reason: `${analysis.reason}；目前在管理員後台，未達非常明確門檻`
      });
      continue;
    }

    if (
      analysis.topScore < MIN_MOVE_SCORE ||
      analysis.scoreGap < MIN_MOVE_GAP ||
      analysis.confidence === '低' ||
      analysis.confidence === '不確定'
    ) {
      manualReview.push({
        ...baseItem,
        reason: `${analysis.reason}；${getManualReason(analysis.topScore, analysis.scoreGap, analysis.confidence)}`
      });
      continue;
    }

    if (moves.length >= MAX_MOVES_PER_PLAN) {
      manualReview.push({
        ...baseItem,
        reason: `${analysis.reason}；已達一次最多搬移 ${MAX_MOVES_PER_PLAN} 個頻道上限`
      });
      continue;
    }

    if (!categoryNames.has(analysis.suggestedCategoryName)) {
      categoriesToCreate.add(analysis.suggestedCategoryName);
    }

    moves.push(baseItem);
  }

  return {
    guildId: guild.id,
    requestedById,
    sourceChannelId,
    createdAt: Date.now(),
    categoriesToCreate: [...categoriesToCreate],
    manualReview,
    moves
  };
}

function getNearbyChannels(channel, guild) {
  const siblings = [...guild.channels.cache.values()]
    .filter((candidate) => (
      candidate.id !== channel.id &&
      candidate.parentId === channel.parentId &&
      candidate.type !== ChannelType.GuildCategory
    ))
    .slice(0, 6)
    .map((candidate) => candidate.name);

  return siblings;
}

function getAIReviewInput(guild, plan) {
  const categories = [...guild.channels.cache.values()]
    .filter((channel) => channel.type === ChannelType.GuildCategory)
    .map((category) => category.name);

  const channels = plan.manualReview
    .map((item) => guild.channels.cache.get(item.channelId))
    .filter(Boolean)
    .filter((channel) => !channel.name.startsWith('ticket-'))
    .slice(0, 20)
    .map((channel) => ({
      name: channel.name,
      type: ChannelType[channel.type] || String(channel.type),
      currentCategory: channel.parent ? channel.parent.name : '無分類',
      nearbyChannels: getNearbyChannels(channel, guild)
    }));

  return {
    guildName: guild.name,
    categories,
    channels
  };
}

function formatPlanItem(item, index) {
  return (
    `${index + 1}. #${item.channelName}\n` +
    `目前：${item.currentCategoryName}\n` +
    `建議：${item.suggestedCategoryName}\n` +
    `分數：${item.score}（差距 ${item.scoreGap}）\n` +
    `信心：${item.confidence}\n` +
    `原因：${item.reason}`
  );
}

function formatMovePreview(plan) {
  if (!plan.moves.length) return '沒有找到可自動搬移的頻道。';

  return plan.moves.map(formatPlanItem).join('\n\n');
}

function formatManualReview(plan) {
  if (!plan.manualReview.length) return '無';

  return plan.manualReview.map(formatPlanItem).join('\n\n');
}

function saveOrganizePlan(id, plan) {
  pendingOrganizePlans.set(id, plan);
}

function getOrganizePlan(id) {
  return pendingOrganizePlans.get(id);
}

function deleteOrganizePlan(id) {
  pendingOrganizePlans.delete(id);
}

module.exports = {
  MAX_MOVES_PER_PLAN,
  createOrganizePlan,
  deleteOrganizePlan,
  formatManualReview,
  formatMovePreview,
  getAIReviewInput,
  getOrganizePlan,
  pendingOrganizePlans,
  saveOrganizePlan,
  scoreChannelName
};
