const { ChannelType } = require('discord.js');
const { ROLE_NAMES } = require('./permissionTemplates');
const { VISIBILITY_TYPES } = require('./channelVisibilityRules');

const REQUIRED_ROLES = [
  { key: 'role_game', name: ROLE_NAMES.game, aliases: ['遊戲玩家', 'game'], color: 0x3498db },
  { key: 'role_night_crew', name: ROLE_NAMES.nightCrew, aliases: ['night crew', '深夜', '夜貓'], color: 0x5865f2 },
  { key: 'role_dev', name: ROLE_NAMES.dev, aliases: ['AI 開發', '開發AI', 'dev'], color: 0x9b59b6 },
  { key: 'role_invest', name: ROLE_NAMES.invest, aliases: ['投資', '股票'], color: 0x27ae60 },
  { key: 'role_guest', name: '👤 訪客', aliases: ['訪客', 'guest'], color: 0x95a5a6 },
  { key: 'role_verified', name: '✅ 已驗證成員', aliases: ['已驗證', 'verified'], color: 0x2ecc71 },
  { key: 'role_party', name: '🧑‍🤝‍🧑 找隊友通知', aliases: ['找隊友通知'], color: 0x1abc9c },
  { key: 'role_announcement', name: '📢 公告通知', aliases: ['公告通知'], color: 0xf4d03f },
  { key: 'role_event', name: '🎉 活動通知', aliases: ['活動通知'], color: 0xff7675 },
  { key: 'role_design', name: '🎨 設計創作', aliases: ['設計創作'], color: 0xe84393 },
  { key: 'role_life', name: '🍜 生活閒聊', aliases: ['生活閒聊'], color: 0xf39c12 }
];

const PUBLIC_ONBOARDING_CHANNELS = [
  'welcome',
  'rules',
  'announcement',
  'role_select',
  'server_guide'
];

const COMMUNITY_LAYOUT = [
  {
    key: 'entry',
    name: '📌｜社群入口',
    aliases: ['社群入口', '入口', '資訊中心'],
    visibilityType: VISIBILITY_TYPES.publicEntry,
    onboardingVisible: true,
    channels: [
      { key: 'welcome', name: '👋｜新人報到', type: ChannelType.GuildText, aliases: ['新人報到', 'welcome', '報到'], visibilityType: VISIBILITY_TYPES.publicEntry, onboardingVisible: true },
      { key: 'rules', name: '📜｜社群規則', type: ChannelType.GuildText, aliases: ['社群規則', '規則', 'rules'], visibilityType: VISIBILITY_TYPES.publicEntry, onboardingVisible: true },
      { key: 'announcement', name: '📢｜公告', type: ChannelType.GuildText, aliases: ['公告', 'announcement'], visibilityType: VISIBILITY_TYPES.semiPublicReadonly, onboardingVisible: true },
      { key: 'role_select', name: '✅｜身分組領取', type: ChannelType.GuildText, aliases: ['身分組領取', '領取身分組', 'roles'], visibilityType: VISIBILITY_TYPES.publicEntry, onboardingVisible: true },
      { key: 'server_guide', name: '🧭｜伺服器導覽', type: ChannelType.GuildText, aliases: ['伺服器導覽', '導覽', 'guide'], visibilityType: VISIBILITY_TYPES.semiPublicReadonly, onboardingVisible: true }
    ]
  },
  {
    key: 'public_lobby',
    name: '💬｜社群大廳',
    aliases: ['社群大廳', '公開大廳', '日常交流'],
    visibilityType: VISIBILITY_TYPES.publicSocial,
    channels: [
      { key: 'general_chat', name: '💬｜一般聊天', type: ChannelType.GuildText, aliases: ['一般聊天', '聊天', 'general'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'late_night_chat', name: '🌙｜深夜聊天', type: ChannelType.GuildText, aliases: ['深夜聊天', '深夜'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'party_lobby', name: '🎮｜找隊友大廳', type: ChannelType.GuildText, aliases: ['找隊友大廳', '找隊友', '組隊大廳'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'music_share', name: '🎵｜音樂分享', type: ChannelType.GuildText, aliases: ['音樂分享'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'food_share', name: '🍜｜美食分享', type: ChannelType.GuildText, aliases: ['美食分享'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'image_share', name: '🖼｜迷因與好圖', type: ChannelType.GuildText, aliases: ['好圖分享', '迷因與好圖'], visibilityType: VISIBILITY_TYPES.publicSocial }
    ]
  },
  {
    key: 'game_center',
    name: '🎮｜遊戲中心',
    aliases: ['遊戲中心', '遊戲大廳'],
    visibilityType: VISIBILITY_TYPES.publicSocial,
    channels: [
      { key: 'lfg_recruit', name: '📢｜組隊招募', type: ChannelType.GuildText, aliases: ['組隊招募', 'lfg', '招募'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'voice_hub', name: '🎮｜目前語音房', type: ChannelType.GuildText, aliases: ['目前語音房', '語音房', 'voice hub'], visibilityType: VISIBILITY_TYPES.semiPublicReadonly },
      { key: 'game_suggestions', name: '📋｜遊戲提議', type: ChannelType.GuildText, aliases: ['遊戲提議', '提議遊戲', 'suggest-game'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'game_archive_info', name: '📦｜遊戲封存區', type: ChannelType.GuildText, aliases: ['遊戲封存區', '遊戲封存'], visibilityType: VISIBILITY_TYPES.archive }
    ]
  },
  {
    key: 'game_tft',
    name: '🎮｜聯盟戰棋',
    aliases: ['TFT', '聯盟戰棋', 'Teamfight Tactics'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.game,
    channels: [
      { key: 'tft_chat', name: '💬｜tft-聊天', type: ChannelType.GuildText, aliases: ['tft聊天', 'tft-聊天'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'tft_party', name: '🧑‍🤝‍🧑｜tft-找隊友', type: ChannelType.GuildText, aliases: ['tft找隊友', 'tft-找隊友'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'tft_info', name: '📌｜tft-資訊', type: ChannelType.GuildText, aliases: ['tft資訊', 'tft-資訊'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'tft_create_voice', name: '🔊｜➕｜建立TFT語音', type: ChannelType.GuildVoice, aliases: ['建立TFT語音', '➕｜建立TFT語音', '建立聯盟戰棋語音'], visibilityType: VISIBILITY_TYPES.roleRestricted, createEntryGame: 'TFT', userLimit: 1 }
    ]
  },
  {
    key: 'game_lol',
    name: '🎮｜英雄聯盟',
    aliases: ['LOL', '英雄聯盟', 'League of Legends', 'league-of-legends'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.game,
    channels: [
      { key: 'lol_chat', name: '💬｜lol-聊天', type: ChannelType.GuildText, aliases: ['lol聊天', 'lol-聊天'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'lol_party', name: '🧑‍🤝‍🧑｜lol-找隊友', type: ChannelType.GuildText, aliases: ['lol找隊友', 'lol-找隊友'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'lol_info', name: '📌｜lol-資訊', type: ChannelType.GuildText, aliases: ['lol資訊', 'lol-資訊'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'lol_create_voice', name: '🔊｜➕｜建立LOL語音', type: ChannelType.GuildVoice, aliases: ['建立LOL語音', '➕｜建立LOL語音'], visibilityType: VISIBILITY_TYPES.roleRestricted, createEntryGame: 'LOL', userLimit: 1 }
    ]
  },
  {
    key: 'game_apex',
    name: '🎮｜APEX',
    aliases: ['APEX', 'Apex Legends'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.game,
    channels: [
      { key: 'apex_chat', name: '💬｜apex-聊天', type: ChannelType.GuildText, aliases: ['apex聊天', 'apex-聊天'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'apex_party', name: '🧑‍🤝‍🧑｜apex-找隊友', type: ChannelType.GuildText, aliases: ['apex找隊友', 'apex-找隊友'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'apex_info', name: '📌｜apex-資訊', type: ChannelType.GuildText, aliases: ['apex資訊', 'apex-資訊'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'apex_create_voice', name: '🔊｜➕｜建立APEX語音', type: ChannelType.GuildVoice, aliases: ['建立APEX語音', '➕｜建立APEX語音'], visibilityType: VISIBILITY_TYPES.roleRestricted, createEntryGame: 'APEX', userLimit: 1 }
    ]
  },
  {
    key: 'game_valorant',
    name: '🎮｜VALORANT',
    aliases: ['VALORANT', '特戰英豪', '特戰'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.game,
    channels: [
      { key: 'valorant_chat', name: '💬｜特戰-聊天', type: ChannelType.GuildText, aliases: ['特戰聊天', '特戰-聊天', 'valorant聊天'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'valorant_party', name: '🧑‍🤝‍🧑｜特戰-找隊友', type: ChannelType.GuildText, aliases: ['特戰找隊友', '特戰-找隊友', 'valorant找隊友'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'valorant_info', name: '📌｜特戰-資訊', type: ChannelType.GuildText, aliases: ['特戰資訊', '特戰-資訊', 'valorant資訊'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'valorant_create_voice', name: '🔊｜➕｜建立VALORANT語音', type: ChannelType.GuildVoice, aliases: ['建立VALORANT語音', '建立特戰語音', '➕｜建立特戰語音'], visibilityType: VISIBILITY_TYPES.roleRestricted, createEntryGame: 'VALORANT', userLimit: 1 }
    ]
  },
  {
    key: 'night_crew',
    name: '🌙｜Night Crew',
    aliases: ['Night Crew', '深夜群', '深夜'],
    visibilityType: VISIBILITY_TYPES.hiddenSpecial,
    roleName: ROLE_NAMES.nightCrew,
    specialRoleName: ROLE_NAMES.nightCrew,
    channels: [
      { key: 'night_chat', name: '🌙｜夜聊', type: ChannelType.GuildText, aliases: ['夜聊'], visibilityType: VISIBILITY_TYPES.hiddenSpecial },
      { key: 'night_radio', name: '🎧｜深夜電台', type: ChannelType.GuildVoice, aliases: ['深夜電台'], visibilityType: VISIBILITY_TYPES.hiddenSpecial },
      { key: 'night_lounge', name: '🛋｜掛機休息室', type: ChannelType.GuildVoice, aliases: ['掛機休息室'], visibilityType: VISIBILITY_TYPES.hiddenSpecial }
    ]
  },
  {
    key: 'creative_dev',
    name: '🛠｜創作與開發',
    aliases: ['創作與開發', '開發專區', 'AI開發'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.dev,
    channels: [
      { key: 'programming', name: '🧑‍💻｜程式開發', type: ChannelType.GuildText, aliases: ['程式開發'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'ai_tools', name: '🤖｜AI工具', type: ChannelType.GuildText, aliases: ['AI工具', 'ai-tools'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'design_works', name: '🎨｜設計作品', type: ChannelType.GuildText, aliases: ['設計作品'], visibilityType: VISIBILITY_TYPES.roleRestricted, roleName: '🎨 設計創作' },
      { key: 'portfolio', name: '📁｜作品展示', type: ChannelType.GuildText, aliases: ['作品展示'], visibilityType: VISIBILITY_TYPES.roleRestricted }
    ]
  },
  {
    key: 'invest',
    name: '📈｜投資討論',
    aliases: ['投資討論', '股票社群'],
    visibilityType: VISIBILITY_TYPES.roleRestricted,
    roleName: ROLE_NAMES.invest,
    channels: [
      { key: 'tw_stock', name: '📊｜台股討論', type: ChannelType.GuildText, aliases: ['台股討論'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'market_watch', name: '📈｜盤勢觀察', type: ChannelType.GuildText, aliases: ['盤勢觀察'], visibilityType: VISIBILITY_TYPES.roleRestricted },
      { key: 'stock_ai', name: '🤖｜股票AI工具', type: ChannelType.GuildText, aliases: ['股票AI工具'], visibilityType: VISIBILITY_TYPES.roleRestricted }
    ]
  },
  {
    key: 'support',
    name: '🎫｜客服支援',
    aliases: ['客服支援', '客服'],
    visibilityType: VISIBILITY_TYPES.publicEntry,
    channels: [
      { key: 'open_ticket', name: '🎟｜開啟客服單', type: ChannelType.GuildText, aliases: ['開啟客服單', 'ticket'], visibilityType: VISIBILITY_TYPES.publicEntry },
      { key: 'bug_report', name: '🐞｜問題回報', type: ChannelType.GuildText, aliases: ['問題回報'], visibilityType: VISIBILITY_TYPES.publicSocial },
      { key: 'suggestions', name: '💡｜建議區', type: ChannelType.GuildText, aliases: ['建議區'], visibilityType: VISIBILITY_TYPES.publicSocial }
    ]
  },
  {
    key: 'admin',
    name: '🔒｜管理員後台',
    aliases: ['管理員後台', '管理後台', 'admin'],
    visibilityType: VISIBILITY_TYPES.privateAdmin,
    channels: [
      { key: 'admin_channel', name: '🔒｜管理員頻道', type: ChannelType.GuildText, aliases: ['管理員頻道'], visibilityType: VISIBILITY_TYPES.privateAdmin },
      { key: 'server_logs', name: '📑｜server-logs', type: ChannelType.GuildText, aliases: ['server-logs'], visibilityType: VISIBILITY_TYPES.privateAdmin },
      { key: 'ticket_logs', name: '📑｜ticket-logs', type: ChannelType.GuildText, aliases: ['ticket-logs'], visibilityType: VISIBILITY_TYPES.privateAdmin },
      { key: 'bot_control', name: '⚙️｜bot-control', type: ChannelType.GuildText, aliases: ['bot-control'], visibilityType: VISIBILITY_TYPES.privateAdmin },
      { key: 'voice_control', name: '🔒｜語音控制台', type: ChannelType.GuildText, aliases: ['語音控制台'], visibilityType: VISIBILITY_TYPES.privateAdmin }
    ]
  },
  {
    key: 'old_archive',
    name: '📦｜舊頻道封存',
    aliases: ['舊頻道封存', '封存區', 'archive'],
    visibilityType: VISIBILITY_TYPES.archive,
    channels: []
  }
];

module.exports = {
  COMMUNITY_LAYOUT,
  PUBLIC_ONBOARDING_CHANNELS,
  REQUIRED_ROLES
};
