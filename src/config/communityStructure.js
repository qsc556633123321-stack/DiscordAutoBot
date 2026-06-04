const { ChannelType } = require('discord.js');

const COMMUNITY_STRUCTURE = [
  {
    key: 'entry',
    name: '📌｜社群入口',
    aliases: ['社群入口', '入口'],
    channels: [
      { key: 'welcome', name: '👋｜新人報到', type: ChannelType.GuildText, aliases: ['新人報到', 'welcome'] },
      { key: 'rules', name: '📜｜社群規則', type: ChannelType.GuildText, aliases: ['規則', 'rules'] },
      { key: 'announcement', name: '📢｜公告', type: ChannelType.GuildText, aliases: ['公告', 'announcement'] },
      { key: 'role_select', name: '✅｜領取身分組', type: ChannelType.GuildText, aliases: ['領取身分組', '身分組領取'] },
      { key: 'server_guide', name: '🧭｜伺服器導覽', type: ChannelType.GuildText, aliases: ['伺服器導覽', '導覽'] },
      { key: 'support_entry', name: '🎫｜客服支援', type: ChannelType.GuildText, aliases: ['客服支援'] }
    ]
  },
  {
    key: 'lobby',
    name: '💬｜社群大廳',
    aliases: ['社群大廳', '公開大廳'],
    channels: [
      { key: 'general_chat', name: '💬｜一般聊天', type: ChannelType.GuildText, aliases: ['一般聊天'] },
      { key: 'late_night_chat', name: '🌙｜深夜聊天', type: ChannelType.GuildText, aliases: ['深夜聊天'] },
      { key: 'party_lobby', name: '🎮｜找隊友大廳', type: ChannelType.GuildText, aliases: ['找隊友大廳'] },
      { key: 'serious_discussion', name: '🧠｜認真討論', type: ChannelType.GuildText, aliases: ['認真討論', '閒聊討論', '討論區'] }
    ]
  },
  {
    key: 'game_center',
    name: '🎮｜遊戲中心',
    aliases: ['遊戲中心', '遊戲大廳'],
    channels: [
      { key: 'lfg_recruit', name: '📢｜組隊招募', type: ChannelType.GuildText, aliases: ['組隊招募', 'lfg'] },
      { key: 'voice_hub', name: '🎮｜目前語音房', type: ChannelType.GuildText, aliases: ['目前語音房', 'voice hub'] },
      { key: 'game_suggestions', name: '📋｜遊戲提議', type: ChannelType.GuildText, aliases: ['遊戲提議', '提議遊戲', 'suggest-game'] }
    ]
  },
  {
    key: 'night_crew',
    name: '🌙｜Night Crew',
    aliases: ['Night Crew', '深夜群'],
    permission: 'night_crew',
    channels: [
      { key: 'night_chat', name: '🌙｜夜聊', type: ChannelType.GuildText, aliases: ['夜聊'] },
      { key: 'night_radio', name: '🎧｜深夜電台', type: ChannelType.GuildVoice, aliases: ['深夜電台'] },
      { key: 'night_lounge', name: '🛋｜掛機休息室', type: ChannelType.GuildVoice, aliases: ['掛機休息室'] }
    ]
  },
  {
    key: 'creative_dev',
    name: '🛠｜創作與開發',
    aliases: ['創作與開發', '開發專區'],
    channels: [
      { key: 'programming', name: '🧑‍💻｜程式開發', type: ChannelType.GuildText, aliases: ['程式開發'] },
      { key: 'ai_tools', name: '🤖｜AI工具', type: ChannelType.GuildText, aliases: ['AI工具'] },
      { key: 'design_works', name: '🎨｜設計作品', type: ChannelType.GuildText, aliases: ['設計作品'] },
      { key: 'portfolio', name: '📁｜作品展示', type: ChannelType.GuildText, aliases: ['作品展示'] }
    ]
  },
  {
    key: 'invest',
    name: '📈｜投資討論',
    aliases: ['投資討論'],
    channels: [
      { key: 'tw_stock', name: '📊｜台股討論', type: ChannelType.GuildText, aliases: ['台股討論'] },
      { key: 'market_watch', name: '📈｜盤勢觀察', type: ChannelType.GuildText, aliases: ['盤勢觀察'] },
      { key: 'stock_ai', name: '🤖｜股票AI工具', type: ChannelType.GuildText, aliases: ['股票AI工具'] }
    ]
  },
  {
    key: 'admin',
    name: '🔒｜管理員後台',
    aliases: ['管理員後台', '管理後台'],
    permission: 'admin',
    channels: [
      { key: 'admin_channel', name: '🔒｜管理員頻道', type: ChannelType.GuildText, aliases: ['管理員頻道'] },
      { key: 'server_logs', name: '📑｜server-logs', type: ChannelType.GuildText, aliases: ['server-logs'] },
      { key: 'ticket_logs', name: '📑｜ticket-logs', type: ChannelType.GuildText, aliases: ['ticket-logs'] },
      { key: 'bot_control', name: '⚙️｜bot-control', type: ChannelType.GuildText, aliases: ['bot-control'] }
    ]
  }
];

module.exports = {
  COMMUNITY_STRUCTURE,
  GAME_ARCHIVE_CATEGORY: '📦｜遊戲封存區',
  GAME_CENTER_CATEGORY: '🎮｜遊戲中心',
  GAME_SUGGESTION_CHANNEL: '📋｜遊戲提議',
  NIGHT_CREW_CATEGORY: '🌙｜Night Crew',
  NIGHT_CREW_ROLE: '🌙 Night Crew'
};
