const GAME_CHANNEL_PATTERNS = /找隊友|組隊|目前語音|遊戲提議/i;
const CHAT_CHANNEL_PATTERNS = /一般聊天|深夜聊天|美食|迷因/i;
const NIGHT_CHANNEL_PATTERNS = /深夜|夜聊|目前語音/i;
const TECH_CHANNEL_PATTERNS = /程式|AI|開發|作品/i;
const FALLBACK_CHANNEL_PATTERNS = /一般聊天|目前語音|組隊招募|伺服器導覽/i;

function normalizeGame(game) {
  return String(game || '').trim();
}

function normalizeStyle(style) {
  return style;
}

function normalizeOnlineTime(onlineTime) {
  return onlineTime;
}

function findChannels(channels, patterns) {
  return channels
    .filter((channel) => channel.isTextBased && patterns.some((pattern) => pattern.test(channel.name)))
    .map((channel) => channel.mention)
    .slice(0, 8);
}

function addChannels(target, channels) {
  channels.forEach((channel) => target.add(channel));
}

function createHelpMeStartRecommendation({ answers = {}, channels = [] } = {}) {
  const recommendedChannels = new Set();
  const roles = new Set();
  const tips = [];
  const game = normalizeGame(answers.game);
  const style = normalizeStyle(answers.style);
  const onlineTime = normalizeOnlineTime(answers.onlineTime);

  if (game) {
    roles.add('🎮 遊戲玩家');
    // Preserve the legacy unescaped RegExp contract, including invalid-pattern errors.
    addChannels(recommendedChannels, findChannels(channels, [new RegExp(game, 'i'), GAME_CHANNEL_PATTERNS]));
    tips.push(`可以先搜尋或提議 \`${game}\` 的遊戲分類。`);
  }

  if (style === 'rank') {
    roles.add('🧑‍🤝‍🧑 找隊友通知');
    tips.push('你可能適合先看找隊友與 LFG 招募卡。');
  }
  if (style === 'chat') {
    roles.add('🍜 生活閒聊');
    addChannels(recommendedChannels, findChannels(channels, [CHAT_CHANNEL_PATTERNS]));
    tips.push('可以先從一般聊天或深夜聊天開始露臉。');
  }
  if (style === 'night') {
    roles.add('🎮 遊戲玩家');
    addChannels(recommendedChannels, findChannels(channels, [NIGHT_CHANNEL_PATTERNS]));
    tips.push('如果常在 00:00-05:00 語音，之後會慢慢累積 Night Crew 資格。');
  }
  if (style === 'tech') {
    roles.add('🛠 開發/AI');
    addChannels(recommendedChannels, findChannels(channels, [TECH_CHANNEL_PATTERNS]));
    tips.push('你可以到 AI / 開發入口分享工具、作品或專案。');
  }

  if (onlineTime === 'late') tips.push('你的上線時間很適合深夜語音文化。');
  if (onlineTime === 'evening') tips.push('晚上通常是組隊與語音最容易成團的時段。');

  if (!recommendedChannels.size) addChannels(recommendedChannels, findChannels(channels, [FALLBACK_CHANNEL_PATTERNS]));

  const recommendation = {
    channels: [...recommendedChannels],
    roles: [...roles],
    tips
  };

  return {
    recommendation,
    aiContext: { answers, recommendation }
  };
}

module.exports = {
  CHAT_CHANNEL_PATTERNS,
  FALLBACK_CHANNEL_PATTERNS,
  GAME_CHANNEL_PATTERNS,
  NIGHT_CHANNEL_PATTERNS,
  TECH_CHANNEL_PATTERNS,
  createHelpMeStartRecommendation,
  findChannels,
  normalizeGame,
  normalizeOnlineTime,
  normalizeStyle
};
