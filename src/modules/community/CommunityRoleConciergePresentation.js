const { EmbedBuilder } = require('discord.js');

function buildCommunityRoleConciergePresentationPayload({ action, added, links = [] } = {}) {
  if (action === 'games') {
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('🎮 遊戲入口')
          .setDescription('目前你可以先看組隊招募、目前語音房，或用 `/suggest-game` 提議新增遊戲分類。')
          .addFields(
            { name: '目前熱門方向', value: 'TFT、LOL、APEX、VALORANT', inline: false },
            { name: '推薦前往', value: links.join('\n') || '目前還沒有找到遊戲入口頻道。', inline: false },
            { name: '身分組', value: added ? '已幫你加入 🎮 遊戲玩家。' : '如果還看不到遊戲分類，請按「領取身分組」。', inline: false }
          )
      ],
      ephemeral: true
    };
  }

  if (action === 'invest' || action === 'dev') {
    const title = action === 'invest' ? '📈 投資入口' : '🧑‍💻 AI / 開發入口';
    const roleName = action === 'invest' ? '📈 股票投資' : '🛠 開發/AI';
    return {
      embeds: [
        new EmbedBuilder()
          .setColor(action === 'invest' ? 0x27ae60 : 0x9b59b6)
          .setTitle(title)
          .setDescription(added ? `已幫你加入 ${roleName}。` : `你可以先領取 ${roleName} 身分組解鎖相關分類。`)
          .addFields({ name: '推薦前往', value: links.join('\n') || '目前還沒有找到相關入口。', inline: false })
      ],
      ephemeral: true
    };
  }

  return null;
}

module.exports = { buildCommunityRoleConciergePresentationPayload };
