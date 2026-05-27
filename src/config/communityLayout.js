const { ChannelType } = require('discord.js');
const { ROLE_NAMES } = require('./permissionTemplates');

const REQUIRED_ROLES = [
  { name: ROLE_NAMES.game, color: 0x3498db },
  { name: ROLE_NAMES.nightCrew, color: 0x5865f2 },
  { name: ROLE_NAMES.dev, color: 0x9b59b6 },
  { name: ROLE_NAMES.invest, color: 0x27ae60 },
  { name: '👤 訪客', color: 0x95a5a6 },
  { name: '✅ 已驗證成員', color: 0x2ecc71 },
  { name: '🧑‍🤝‍🧑 找隊友通知', color: 0x1abc9c },
  { name: '📢 公告通知', color: 0xf4d03f },
  { name: '🎉 活動通知', color: 0xff7675 }
];

const PUBLIC_ONBOARDING_CHANNELS = [
  '👋｜新人報到',
  '📜｜社群規則',
  '📢｜公告',
  '🧭｜伺服器導覽',
  '💬｜一般聊天',
  '🌙｜深夜聊天',
  '🎮｜找隊友大廳',
  '🎮｜目前語音房'
];

const COMMUNITY_LAYOUT = [
  {
    name: '📌｜社群入口',
    permission: 'publicEntry',
    onboardingVisible: true,
    channels: [
      { name: '👋｜新人報到', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '📜｜社群規則', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '📢｜公告', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '🧭｜伺服器導覽', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '💬｜一般聊天', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '🌙｜深夜聊天', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '🎮｜找隊友大廳', type: ChannelType.GuildText, onboardingVisible: true },
      { name: '🎮｜目前語音房', type: ChannelType.GuildText, onboardingVisible: true }
    ]
  },
  {
    name: '🎮｜LOL',
    permission: 'semiPublic',
    roleName: ROLE_NAMES.game,
    channels: [
      { name: '💬｜lol-聊天', type: ChannelType.GuildText },
      { name: '🧑‍🤝‍🧑｜lol-找隊友', type: ChannelType.GuildText },
      { name: '📌｜lol-資訊', type: ChannelType.GuildText },
      { name: '🔊｜➕｜建立LOL語音', type: ChannelType.GuildVoice, createEntryGame: 'LOL', userLimit: 1 }
    ]
  },
  {
    name: '🎮｜TFT',
    permission: 'semiPublic',
    roleName: ROLE_NAMES.game,
    channels: [
      { name: '💬｜tft-聊天', type: ChannelType.GuildText },
      { name: '🧑‍🤝‍🧑｜tft-找隊友', type: ChannelType.GuildText },
      { name: '📌｜tft-資訊', type: ChannelType.GuildText },
      { name: '🔊｜➕｜建立TFT語音', type: ChannelType.GuildVoice, createEntryGame: 'TFT', userLimit: 1 }
    ]
  },
  {
    name: '🎮｜APEX',
    permission: 'semiPublic',
    roleName: ROLE_NAMES.game,
    channels: [
      { name: '💬｜apex-聊天', type: ChannelType.GuildText },
      { name: '🧑‍🤝‍🧑｜apex-找隊友', type: ChannelType.GuildText },
      { name: '📌｜apex-資訊', type: ChannelType.GuildText },
      { name: '🔊｜➕｜建立APEX語音', type: ChannelType.GuildVoice, createEntryGame: 'APEX', userLimit: 1 }
    ]
  },
  {
    name: '🎮｜VALORANT',
    permission: 'semiPublic',
    roleName: ROLE_NAMES.game,
    channels: [
      { name: '💬｜valorant-聊天', type: ChannelType.GuildText },
      { name: '🧑‍🤝‍🧑｜valorant-找隊友', type: ChannelType.GuildText },
      { name: '📌｜valorant-資訊', type: ChannelType.GuildText },
      { name: '🔊｜➕｜建立VALORANT語音', type: ChannelType.GuildVoice, createEntryGame: 'VALORANT', userLimit: 1 }
    ]
  },
  {
    name: '🌙｜Night Crew',
    permission: 'nightCrew',
    roleName: ROLE_NAMES.nightCrew,
    channels: [
      { name: '🌙｜夜聊', type: ChannelType.GuildText },
      { name: '🎧｜深夜電台', type: ChannelType.GuildVoice },
      { name: '🛋｜掛機休息室', type: ChannelType.GuildVoice }
    ]
  },
  {
    name: '🛠｜創作與開發',
    permission: 'roleRestricted',
    roleName: ROLE_NAMES.dev,
    channels: [
      { name: '🧑‍💻｜程式開發', type: ChannelType.GuildText },
      { name: '🤖｜AI工具', type: ChannelType.GuildText },
      { name: '🎨｜設計作品', type: ChannelType.GuildText },
      { name: '📁｜作品展示', type: ChannelType.GuildText }
    ]
  },
  {
    name: '📈｜投資討論',
    permission: 'roleRestricted',
    roleName: ROLE_NAMES.invest,
    channels: [
      { name: '📊｜台股討論', type: ChannelType.GuildText },
      { name: '📈｜盤勢觀察', type: ChannelType.GuildText },
      { name: '🤖｜股票AI工具', type: ChannelType.GuildText }
    ]
  },
  {
    name: '🔒｜管理員後台',
    permission: 'adminOnly',
    channels: [
      { name: '🔒｜管理員頻道', type: ChannelType.GuildText },
      { name: '📑｜server-logs', type: ChannelType.GuildText },
      { name: '📑｜ticket-logs', type: ChannelType.GuildText },
      { name: '⚙️｜bot-control', type: ChannelType.GuildText }
    ]
  }
];

module.exports = {
  COMMUNITY_LAYOUT,
  PUBLIC_ONBOARDING_CHANNELS,
  REQUIRED_ROLES
};
