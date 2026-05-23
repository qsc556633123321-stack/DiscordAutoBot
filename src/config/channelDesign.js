const { ChannelType } = require('discord.js');

const CHANNEL_DESIGN = [
  {
    name: '📌｜社群入口',
    permission: 'entry',
    channels: [
      { name: '👋｜新人報到', type: ChannelType.GuildText, aliases: ['新人報到', 'welcome', '報到'] },
      { name: '📜｜社群規則', type: ChannelType.GuildText, aliases: ['規則', '社群規則', 'rules'] },
      { name: '📢｜公告', type: ChannelType.GuildText, aliases: ['公告', '官方公告', 'announcement'] },
      { name: '✅｜身分組領取', type: ChannelType.GuildText, aliases: ['身分組', '身分組領取', '角色領取', 'roles'] },
      { name: '🧭｜伺服器導覽', type: ChannelType.GuildText, aliases: ['伺服器導覽', '導覽', 'guide'] }
    ]
  },
  {
    name: '💬｜公開大廳',
    permission: 'verified',
    channels: [
      { name: '💬｜一般聊天', type: ChannelType.GuildText, aliases: ['一般聊天', '聊天', '閒聊'] },
      { name: '🎮｜找隊友大廳', type: ChannelType.GuildText, aliases: ['找隊友大廳', '找隊友'] },
      { name: '📅｜活動公告', type: ChannelType.GuildText, aliases: ['活動公告'] },
      { name: '🖼｜好圖分享', type: ChannelType.GuildText, aliases: ['好圖分享', '圖片分享'] },
      { name: '🍜｜美食分享', type: ChannelType.GuildText, aliases: ['美食分享'] },
      { name: '🎵｜音樂分享', type: ChannelType.GuildText, aliases: ['音樂分享'] },
      { name: '🧠｜閒聊討論', type: ChannelType.GuildText, aliases: ['閒聊討論', '討論區'] }
    ]
  },
  {
    name: '🎮｜遊戲大廳',
    permission: 'verified',
    channels: [
      { name: '📢｜組隊招募', type: ChannelType.GuildText, aliases: ['組隊招募'] },
      { name: '🎮｜目前語音房', type: ChannelType.GuildText, aliases: ['目前語音房'] }
    ]
  },
  {
    name: '🎮｜聯盟戰棋',
    permission: 'game',
    channels: [
      { name: '💬｜tft-聊天', type: ChannelType.GuildText, aliases: ['tft-聊天'] },
      { name: '🧑‍🤝‍🧑｜tft-找隊友', type: ChannelType.GuildText, aliases: ['tft-找隊友'] },
      { name: '🏆｜tft-戰績分享', type: ChannelType.GuildText, aliases: ['tft-戰績分享'] },
      { name: '📌｜tft-資訊', type: ChannelType.GuildText, aliases: ['tft-資訊'] },
      { name: '🔊｜➕｜建立聯盟戰棋語音', type: ChannelType.GuildVoice, aliases: ['➕｜建立聯盟戰棋語音', '建立聯盟戰棋語音'] }
    ]
  },
  {
    name: '🎮｜英雄聯盟',
    permission: 'game',
    channels: [
      { name: '💬｜lol-聊天', type: ChannelType.GuildText, aliases: ['lol-聊天'] },
      { name: '🧑‍🤝‍🧑｜lol-找隊友', type: ChannelType.GuildText, aliases: ['lol-找隊友'] },
      { name: '🏆｜lol-戰績分享', type: ChannelType.GuildText, aliases: ['lol-戰績分享'] },
      { name: '📌｜lol-資訊', type: ChannelType.GuildText, aliases: ['lol-資訊'] },
      { name: '🔊｜➕｜建立LOL語音', type: ChannelType.GuildVoice, aliases: ['➕｜建立LOL語音', '建立LOL語音'] }
    ]
  },
  {
    name: '🎮｜APEX',
    permission: 'game',
    channels: [
      { name: '💬｜apex-聊天', type: ChannelType.GuildText, aliases: ['apex-聊天'] },
      { name: '🧑‍🤝‍🧑｜apex-找隊友', type: ChannelType.GuildText, aliases: ['apex-找隊友'] },
      { name: '🏆｜apex-戰績分享', type: ChannelType.GuildText, aliases: ['apex-戰績分享'] },
      { name: '📌｜apex-資訊', type: ChannelType.GuildText, aliases: ['apex-資訊'] },
      { name: '🔊｜➕｜建立APEX語音', type: ChannelType.GuildVoice, aliases: ['➕｜建立APEX語音', '建立APEX語音'] }
    ]
  },
  {
    name: '🎮｜特戰英豪',
    permission: 'game',
    channels: [
      { name: '💬｜特戰-聊天', type: ChannelType.GuildText, aliases: ['特戰-聊天'] },
      { name: '🧑‍🤝‍🧑｜特戰-找隊友', type: ChannelType.GuildText, aliases: ['特戰-找隊友'] },
      { name: '🏆｜特戰-戰績分享', type: ChannelType.GuildText, aliases: ['特戰-戰績分享'] },
      { name: '📌｜特戰-資訊', type: ChannelType.GuildText, aliases: ['特戰-資訊'] },
      { name: '🔊｜➕｜建立特戰語音', type: ChannelType.GuildVoice, aliases: ['➕｜建立特戰語音', '建立特戰語音'] }
    ]
  },
  {
    name: '🛠｜創作與開發',
    permission: 'dev',
    channels: [
      { name: '🧑‍💻｜程式開發', type: ChannelType.GuildText, aliases: ['程式開發'] },
      { name: '🤖｜AI工具', type: ChannelType.GuildText, aliases: ['AI工具', 'ai工具'] },
      { name: '🎨｜設計作品', type: ChannelType.GuildText, aliases: ['設計作品'] },
      { name: '📁｜作品展示', type: ChannelType.GuildText, aliases: ['作品展示'] },
      { name: '🧪｜專案測試', type: ChannelType.GuildText, aliases: ['專案測試'] }
    ]
  },
  {
    name: '📈｜投資討論',
    permission: 'invest',
    channels: [
      { name: '📊｜台股討論', type: ChannelType.GuildText, aliases: ['台股討論'] },
      { name: '📈｜盤勢觀察', type: ChannelType.GuildText, aliases: ['盤勢觀察'] },
      { name: '🧠｜投資筆記', type: ChannelType.GuildText, aliases: ['投資筆記'] },
      { name: '🤖｜股票AI工具', type: ChannelType.GuildText, aliases: ['股票AI工具'] }
    ]
  },
  {
    name: '🎫｜客服支援',
    permission: 'entry',
    channels: [
      { name: '🎟｜開啟客服單', type: ChannelType.GuildText, aliases: ['開啟客服單'] },
      { name: '🐞｜問題回報', type: ChannelType.GuildText, aliases: ['問題回報'] },
      { name: '💡｜建議區', type: ChannelType.GuildText, aliases: ['建議區'] }
    ]
  },
  {
    name: '🔒｜管理員後台',
    permission: 'admin',
    channels: [
      { name: '🔒｜管理員頻道', type: ChannelType.GuildText, aliases: ['管理員頻道'] },
      { name: '📑｜server-logs', type: ChannelType.GuildText, aliases: ['server-logs'] },
      { name: '📑｜ticket-logs', type: ChannelType.GuildText, aliases: ['ticket-logs'] },
      { name: '🧹｜整理紀錄', type: ChannelType.GuildText, aliases: ['整理紀錄'] },
      { name: '⚙️｜bot-control', type: ChannelType.GuildText, aliases: ['bot-control'] },
      { name: '🔒｜語音控制台', type: ChannelType.GuildText, aliases: ['語音控制台'] }
    ]
  },
  {
    name: '📦｜舊頻道封存',
    permission: 'archive',
    channels: []
  }
];

module.exports = {
  CHANNEL_DESIGN
};
