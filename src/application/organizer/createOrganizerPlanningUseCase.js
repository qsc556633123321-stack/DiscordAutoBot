const { normalizeName, scoreChannelName } = require('../../domain/organizer/organizerScoring');

const MAX_MOVES_PER_PLAN = 20;
const MIN_MOVE_SCORE = 5;
const MIN_MOVE_GAP = 2;
const ADMIN_AREA_STRICT_SCORE = 8;
const ADMIN_AREA_STRICT_GAP = 4;

function createOrganizerPlanningUseCase({ channelRuleReader, channelTools, logger = console } = {}) {
  if (!channelRuleReader) throw new Error('channelRuleReader is required');
  if (!channelTools) throw new Error('channelTools is required');

  const {
    categoryType,
    movableTypes,
    voiceTypes,
    inferGameCategoryName,
    isCreateVoiceChannel,
    isTempVoice
  } = channelTools;

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

    if (!voiceTypes.has(channel.type)) return result;
    if (/管理|後台|admin|mod|客服|支援|ticket/.test(normalizeName(channel.name)) || gameCategoryName) return result;

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

  function getMemoryRules(guildId) {
    try {
      const rules = channelRuleReader.listByGuild(guildId);
      return Array.isArray(rules) ? rules : [];
    } catch (error) {
      logger.error('讀取伺服器記憶失敗，略過記憶加分：', error);
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
    if (!movableTypes.has(channel.type)) return false;
    if (channel.id === sourceChannelId || channel.name.startsWith('ticket-')) return false;
    if (isCreateVoiceChannel(channel)) return false;
    return !(channel.guild && isTempVoice(channel.guild.id, channel.id));
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

  function createPlan(guild, sourceChannelId, requestedById) {
    const channels = [...guild.channels.cache.values()];
    const categoryNames = new Set(channels.filter((channel) => channel.type === categoryType).map((category) => category.name));
    const memoryRules = getMemoryRules(guild.id);
    const moves = [];
    const manualReview = [];
    const categoriesToCreate = new Set();

    for (const channel of channels) {
      if (!isMovableChannel(channel, sourceChannelId)) continue;
      const analysis = buildAnalysis(channel, memoryRules);
      const baseItem = {
        channelId: channel.id,
        channelName: channel.name,
        currentCategoryName: channel.parent ? channel.parent.name : '無分類',
        suggestedCategoryName: analysis.suggestedCategoryName,
        score: analysis.topScore,
        secondScore: analysis.secondScore,
        scoreGap: analysis.scoreGap,
        confidence: analysis.confidence,
        reason: analysis.reason
      };

      if (analysis.topScore === 0 || (channel.parent && channel.parent.name === analysis.suggestedCategoryName)) continue;
      if (isAdminArea(channel) && !(analysis.topScore >= ADMIN_AREA_STRICT_SCORE && analysis.scoreGap >= ADMIN_AREA_STRICT_GAP)) {
        manualReview.push({ ...baseItem, reason: `${analysis.reason}；目前在管理員後台，未達非常明確門檻` });
        continue;
      }
      if (analysis.topScore < MIN_MOVE_SCORE || analysis.scoreGap < MIN_MOVE_GAP || ['低', '不確定'].includes(analysis.confidence)) {
        manualReview.push({ ...baseItem, reason: `${analysis.reason}；${getManualReason(analysis.topScore, analysis.scoreGap, analysis.confidence)}` });
        continue;
      }
      if (moves.length >= MAX_MOVES_PER_PLAN) {
        manualReview.push({ ...baseItem, reason: `${analysis.reason}；已達一次最多搬移 ${MAX_MOVES_PER_PLAN} 個頻道上限` });
        continue;
      }
      if (!categoryNames.has(analysis.suggestedCategoryName)) categoriesToCreate.add(analysis.suggestedCategoryName);
      moves.push(baseItem);
    }

    return { guildId: guild.id, requestedById, sourceChannelId, createdAt: Date.now(), categoriesToCreate: [...categoriesToCreate], manualReview, moves };
  }

  function getAIReviewInput(guild, plan) {
    const categories = [...guild.channels.cache.values()].filter((channel) => channel.type === categoryType).map((category) => category.name);
    const channels = plan.manualReview
      .map((item) => guild.channels.cache.get(item.channelId))
      .filter(Boolean)
      .filter((channel) => !channel.name.startsWith('ticket-'))
      .slice(0, 20)
      .map((channel) => ({
        name: channel.name,
        type: channelTools.typeName(channel.type),
        currentCategory: channel.parent ? channel.parent.name : '無分類',
        nearbyChannels: [...guild.channels.cache.values()]
          .filter((candidate) => candidate.id !== channel.id && candidate.parentId === channel.parentId && candidate.type !== categoryType)
          .slice(0, 6)
          .map((candidate) => candidate.name)
      }));
    return { guildName: guild.name, categories, channels };
  }

  return { createPlan, getAIReviewInput, scoreChannelName };
}

module.exports = { MAX_MOVES_PER_PLAN, createOrganizerPlanningUseCase };
