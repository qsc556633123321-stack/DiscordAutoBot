const { ChannelType } = require('discord.js');

const CHANNEL_DESIGN = [
  {
    key: 'entry',
    name: '📌｜社群入口',
    aliases: ['社群入口', '入口', '資訊中心'],
    permission: 'entry',
    channels: [
      { key: 'welcome', name: '👋｜新人報到', type: ChannelType.GuildText, aliases: ['新人報到', 'welcome'] },
      { key: 'rules', name: '📜｜社群規則', type: ChannelType.GuildText, aliases: ['規則', 'rules'] },
      { key: 'announcement', name: '📢｜公告', type: ChannelType.GuildText, aliases: ['公告', 'announcement'] },
      { key: 'role_select', name: '✅｜領取身分組', type: ChannelType.GuildText, aliases: ['領取身分組', '身分組領取'] },
      { key: 'server_guide', name: '🧭｜伺服器導覽', type: ChannelType.GuildText, aliases: ['伺服器導覽', '導覽'] }
    ]
  },
  {
    key: 'public_lobby',
    name: '💬｜社群大廳',
    aliases: ['公開大廳', '社群大廳', '日常交流'],
    permission: 'entry',
    channels: [
      { key: 'general_chat', name: '💬｜一般聊天', type: ChannelType.GuildText, aliases: ['一般聊天', '聊天'] },
      { key: 'late_night_chat', name: '🌙｜深夜聊天', type: ChannelType.GuildText, aliases: ['深夜聊天'] },
      { key: 'party_lobby', name: '🎮｜找隊友大廳', type: ChannelType.GuildText, aliases: ['找隊友大廳'] },
      { key: 'activity_announcement', name: '📅｜活動公告', type: ChannelType.GuildText, aliases: ['活動公告'] },
      { key: 'image_share', name: '🖼｜好圖分享', type: ChannelType.GuildText, aliases: ['好圖分享', '迷因與好圖'] },
      { key: 'food_share', name: '🍜｜美食分享', type: ChannelType.GuildText, aliases: ['美食分享'] },
      { key: 'music_share', name: '🎵｜音樂分享', type: ChannelType.GuildText, aliases: ['音樂分享'] },
      { key: 'casual_discussion', name: '🧠｜閒聊討論', type: ChannelType.GuildText, aliases: ['閒聊討論'] }
    ]
  },
  {
    key: 'game_center',
    name: '🎮｜遊戲中心',
    aliases: ['遊戲中心', '遊戲大廳'],
    permission: 'entry',
    channels: [
      { key: 'lfg_recruit', name: '📢｜組隊招募', type: ChannelType.GuildText, aliases: ['組隊招募', 'lfg'] },
      { key: 'voice_hub', name: '🎮｜目前語音房', type: ChannelType.GuildText, aliases: ['目前語音房', 'voice hub'] },
      { key: 'game_suggestions', name: '📋｜遊戲提議', type: ChannelType.GuildText, aliases: ['遊戲提議', '提議遊戲', 'suggest-game'] },
      { key: 'game_archive_info', name: '📦｜遊戲封存區', type: ChannelType.GuildText, aliases: ['遊戲封存區'] }
    ]
  },
  {
    key: 'game_tft',
    name: '🎮｜聯盟戰棋',
    aliases: ['TFT', '聯盟戰棋', 'Teamfight Tactics'],
    permission: 'game',
    channels: [
      { key: 'tft_chat', name: '💬｜tft-聊天', type: ChannelType.GuildText, aliases: ['tft-聊天'] },
      { key: 'tft_party', name: '🧑‍🤝‍🧑｜tft-找隊友', type: ChannelType.GuildText, aliases: ['tft-找隊友'] },
      { key: 'tft_info', name: '📌｜tft-資訊', type: ChannelType.GuildText, aliases: ['tft-資訊'] },
      { key: 'tft_create_voice', name: '🔊｜➕｜建立TFT語音', type: ChannelType.GuildVoice, aliases: ['建立TFT語音', '建立聯盟戰棋語音'] }
    ]
  },
  {
    key: 'game_lol',
    name: '🎮｜英雄聯盟',
    aliases: ['LOL', '英雄聯盟', 'League of Legends', 'league-of-legends'],
    permission: 'game',
    channels: [
      { key: 'lol_chat', name: '💬｜lol-聊天', type: ChannelType.GuildText, aliases: ['lol-聊天'] },
      { key: 'lol_party', name: '🧑‍🤝‍🧑｜lol-找隊友', type: ChannelType.GuildText, aliases: ['lol-找隊友'] },
      { key: 'lol_info', name: '📌｜lol-資訊', type: ChannelType.GuildText, aliases: ['lol-資訊'] },
      { key: 'lol_create_voice', name: '🔊｜➕｜建立LOL語音', type: ChannelType.GuildVoice, aliases: ['建立LOL語音'] }
    ]
  },
  {
    key: 'game_apex',
    name: '🎮｜APEX',
    aliases: ['APEX', 'Apex Legends'],
    permission: 'game',
    channels: [
      { key: 'apex_chat', name: '💬｜apex-聊天', type: ChannelType.GuildText, aliases: ['apex-聊天'] },
      { key: 'apex_party', name: '🧑‍🤝‍🧑｜apex-找隊友', type: ChannelType.GuildText, aliases: ['apex-找隊友'] },
      { key: 'apex_info', name: '📌｜apex-資訊', type: ChannelType.GuildText, aliases: ['apex-資訊'] },
      { key: 'apex_create_voice', name: '🔊｜➕｜建立APEX語音', type: ChannelType.GuildVoice, aliases: ['建立APEX語音'] }
    ]
  },
  {
    key: 'game_valorant',
    name: '🎮｜VALORANT',
    aliases: ['VALORANT', '特戰英豪', '特戰'],
    permission: 'game',
    channels: [
      { key: 'valorant_chat', name: '💬｜特戰-聊天', type: ChannelType.GuildText, aliases: ['特戰-聊天', 'valorant-聊天'] },
      { key: 'valorant_party', name: '🧑‍🤝‍🧑｜特戰-找隊友', type: ChannelType.GuildText, aliases: ['特戰-找隊友', 'valorant-找隊友'] },
      { key: 'valorant_info', name: '📌｜特戰-資訊', type: ChannelType.GuildText, aliases: ['特戰-資訊', 'valorant-資訊'] },
      { key: 'valorant_create_voice', name: '🔊｜➕｜建立VALORANT語音', type: ChannelType.GuildVoice, aliases: ['建立VALORANT語音', '建立特戰語音'] }
    ]
  },
  {
    key: 'night_crew',
    name: '🌙｜Night Crew',
    aliases: ['Night Crew', '深夜群'],
    permission: 'verified',
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
    permission: 'dev',
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
    permission: 'invest',
    channels: [
      { key: 'tw_stock', name: '📊｜台股討論', type: ChannelType.GuildText, aliases: ['台股討論'] },
      { key: 'market_watch', name: '📈｜盤勢觀察', type: ChannelType.GuildText, aliases: ['盤勢觀察'] },
      { key: 'stock_ai', name: '🤖｜股票AI工具', type: ChannelType.GuildText, aliases: ['股票AI工具'] }
    ]
  },
  {
    key: 'support',
    name: '🎫｜客服支援',
    aliases: ['客服支援', '客服'],
    permission: 'entry',
    channels: [
      { key: 'open_ticket', name: '🎟｜開啟客服單', type: ChannelType.GuildText, aliases: ['開啟客服單', 'ticket'] },
      { key: 'bug_report', name: '🐞｜問題回報', type: ChannelType.GuildText, aliases: ['問題回報'] },
      { key: 'suggestions', name: '💡｜建議區', type: ChannelType.GuildText, aliases: ['建議區'] }
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
  },
  {
    key: 'old_archive',
    name: '📦｜舊頻道封存',
    aliases: ['舊頻道封存', '封存區'],
    permission: 'archive',
    channels: []
  }
];

module.exports = {
  CHANNEL_DESIGN
};
