const { EmbedBuilder } = require('discord.js');
const { generateConciergeText } = require('./communityConcierge');

function findChannels(guild, patterns) {
  return guild.channels.cache
    .filter((channel) => channel.isTextBased?.() && patterns.some((pattern) => pattern.test(channel.name)))
    .map((channel) => `${channel}`)
    .slice(0, 8);
}

function buildBaseRecommendation(guild, answers) {
  const channels = new Set();
  const roles = new Set();
  const tips = [];
  const game = String(answers.game || '').trim();
  const style = answers.style;
  const onlineTime = answers.onlineTime;

  if (game) {
    roles.add('🎮 遊戲玩家');
    findChannels(guild, [new RegExp(game, 'i'), /找隊友|組隊|目前語音|遊戲提議/i]).forEach((item) => channels.add(item));
    tips.push(`可以先搜尋或提議 \`${game}\` 的遊戲分類。`);
  }

  if (style === 'rank') {
    roles.add('🧑‍🤝‍🧑 找隊友通知');
    tips.push('你可能適合先看找隊友與 LFG 招募卡。');
  }
  if (style === 'chat') {
    roles.add('🍜 生活閒聊');
    findChannels(guild, [/一般聊天|深夜聊天|美食|迷因/i]).forEach((item) => channels.add(item));
    tips.push('可以先從一般聊天或深夜聊天開始露臉。');
  }
  if (style === 'night') {
    roles.add('🎮 遊戲玩家');
    findChannels(guild, [/深夜|夜聊|目前語音/i]).forEach((item) => channels.add(item));
    tips.push('如果常在 00:00-05:00 語音，之後會慢慢累積 Night Crew 資格。');
  }
  if (style === 'tech') {
    roles.add('🛠 開發/AI');
    findChannels(guild, [/程式|AI|開發|作品/i]).forEach((item) => channels.add(item));
    tips.push('你可以到 AI / 開發入口分享工具、作品或專案。');
  }

  if (onlineTime === 'late') tips.push('你的上線時間很適合深夜語音文化。');
  if (onlineTime === 'evening') tips.push('晚上通常是組隊與語音最容易成團的時段。');

  if (!channels.size) findChannels(guild, [/一般聊天|目前語音|組隊招募|伺服器導覽/i]).forEach((item) => channels.add(item));

  return {
    channels: [...channels],
    roles: [...roles],
    tips
  };
}

async function buildHelpMeStartEmbed(guild, answers) {
  const recommendation = buildBaseRecommendation(guild, answers);
  const aiText = await generateConciergeText('help_me_start', {
    guildName: guild.name,
    answers,
    recommendation
  }, '我會建議你先領對身分組，再去目前語音房或找隊友大廳看看。');

  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🧭 你的快速開始路線')
    .setDescription(aiText)
    .addFields(
      { name: '推薦頻道', value: recommendation.channels.join('\n') || '先從伺服器導覽開始。', inline: false },
      { name: '建議身分組', value: recommendation.roles.join('\n') || '先領取你感興趣的身分組。', inline: false },
      { name: '開始方式', value: recommendation.tips.join('\n') || '看看目前語音房，或用 `/suggest-game` 提議想玩的遊戲。', inline: false }
    )
    .setFooter({ text: '這只是起點，你可以慢慢調整自己的社群路線。' })
    .setTimestamp();
}

module.exports = {
  buildHelpMeStartEmbed
};
