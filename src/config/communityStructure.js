const { ChannelType } = require('discord.js');

const COMMUNITY_STRUCTURE = [
  {
    name: '📌｜社群入口',
    channels: [
      { name: '👋｜新人報到', type: ChannelType.GuildText },
      { name: '📜｜社群規則', type: ChannelType.GuildText },
      { name: '📢｜公告', type: ChannelType.GuildText },
      { name: '✅｜領取身分組', type: ChannelType.GuildText },
      { name: '🧭｜伺服器導覽', type: ChannelType.GuildText },
      { name: '🎫｜客服支援', type: ChannelType.GuildText }
    ]
  },
  {
    name: '💬｜社群大廳',
    channels: [
      { name: '💬｜一般聊天', type: ChannelType.GuildText },
      { name: '🌙｜深夜聊天', type: ChannelType.GuildText },
      { name: '🎮｜找隊友大廳', type: ChannelType.GuildText },
      { name: '🎵｜音樂分享', type: ChannelType.GuildText },
      { name: '🍜｜美食分享', type: ChannelType.GuildText },
      { name: '🖼｜迷因與好圖', type: ChannelType.GuildText }
    ]
  },
  {
    name: '🎮｜遊戲中心',
    channels: [
      { name: '📢｜組隊招募', type: ChannelType.GuildText },
      { name: '🎮｜目前語音房', type: ChannelType.GuildText },
      { name: '📋｜遊戲提議', type: ChannelType.GuildText },
      { name: '📦｜遊戲封存區', type: ChannelType.GuildText }
    ]
  },
  {
    name: '🌙｜Night Crew',
    permission: 'night_crew',
    channels: [
      { name: '🌙｜夜聊', type: ChannelType.GuildText },
      { name: '🎧｜深夜電台', type: ChannelType.GuildVoice },
      { name: '🛋｜掛機休息室', type: ChannelType.GuildVoice }
    ]
  },
  {
    name: '🛠｜創作與開發',
    channels: [
      { name: '🧑‍💻｜程式開發', type: ChannelType.GuildText },
      { name: '🤖｜AI工具', type: ChannelType.GuildText },
      { name: '🎨｜設計作品', type: ChannelType.GuildText },
      { name: '📁｜作品展示', type: ChannelType.GuildText }
    ]
  },
  {
    name: '📈｜投資討論',
    channels: [
      { name: '📊｜台股討論', type: ChannelType.GuildText },
      { name: '📈｜盤勢觀察', type: ChannelType.GuildText },
      { name: '🤖｜股票AI工具', type: ChannelType.GuildText }
    ]
  },
  {
    name: '🔒｜管理員後台',
    permission: 'admin',
    channels: [
      { name: '🔒｜管理員頻道', type: ChannelType.GuildText },
      { name: '📑｜server-logs', type: ChannelType.GuildText },
      { name: '📑｜ticket-logs', type: ChannelType.GuildText },
      { name: '⚙️｜bot-control', type: ChannelType.GuildText }
    ]
  }
];

module.exports = {
  COMMUNITY_STRUCTURE,
  GAME_CENTER_CATEGORY: '🎮｜遊戲中心',
  GAME_SUGGESTION_CHANNEL: '📋｜遊戲提議',
  GAME_ARCHIVE_CATEGORY: '📦｜遊戲封存區',
  NIGHT_CREW_CATEGORY: '🌙｜Night Crew',
  NIGHT_CREW_ROLE: '🌙 Night Crew'
};
