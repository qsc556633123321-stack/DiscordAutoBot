const { EmbedBuilder } = require('discord.js');

function createHelpMeStartEmbed({ description, recommendation, timestamp } = {}) {
  return new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🧭 你的快速開始路線')
    .setDescription(description)
    .addFields(
      { name: '推薦頻道', value: recommendation.channels.join('\n') || '先從伺服器導覽開始。', inline: false },
      { name: '建議身分組', value: recommendation.roles.join('\n') || '先領取你感興趣的身分組。', inline: false },
      { name: '開始方式', value: recommendation.tips.join('\n') || '看看目前語音房，或用 `/suggest-game` 提議想玩的遊戲。', inline: false }
    )
    .setFooter({ text: '這只是起點，你可以慢慢調整自己的社群路線。' })
    .setTimestamp(timestamp);
}

module.exports = { createHelpMeStartEmbed };
