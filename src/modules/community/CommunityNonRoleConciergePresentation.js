const { EmbedBuilder } = require('discord.js');

function buildCommunityNonRoleConciergePresentationPayload({
  action,
  links = [],
  buildRoadmapEmbed
} = {}) {
  if (action === 'night') {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(0x2f3136)
          .setTitle('🌙 深夜聊天室入口')
          .setDescription('如果你常在 00:00-05:00 語音出沒，累積到一定程度會解鎖 Night Crew。')
          .addFields(
            { name: '可以先去', value: links.join('\n') || '目前還沒有找到深夜入口。', inline: false },
            { name: '怎麼開始', value: '看看目前語音房，或自己開一間「深夜聊天」Temp Voice。', inline: false }
          )
      ],
      ephemeral: true
    };
  }

  if (action === 'bot') {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('🤖 Community OS 功能')
          .setDescription(
            '- 🎧 Temp Voice：自動建立臨時語音\n' +
            '- 📢 LFG 招募：用招募卡加入語音\n' +
            '- 🌙 Night Crew：深夜語音文化\n' +
            '- 🤝 社交語音統計：熟人感與語音檔案\n' +
            '- 🧠 AI 社群氣氛：短文案與導覽\n' +
            '- 🎮 動態遊戲分類：玩家提議、管理員批准\n' +
            '- 🛡 Member Guard：新人安全防護\n' +
            '- 🔗 Link Guard：惡意連結防護'
          )
      ],
      ephemeral: true
    };
  }

  if (action === 'roadmap') {
    return {
      embeds: [buildRoadmapEmbed()],
      ephemeral: true
    };
  }

  return null;
}

module.exports = { buildCommunityNonRoleConciergePresentationPayload };
