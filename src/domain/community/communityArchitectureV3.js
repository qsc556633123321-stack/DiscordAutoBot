const { CHANNEL_TYPES } = require('../../core/constants');

const V3_VERSION = '4.0.0-lite';

const ROLES = [
  { key: 'owner', name: '👑 站長', aliases: ['站長'], color: 0xf1c40f, hoist: true },
  { key: 'admin', name: '🛡 管理員', aliases: ['管理員'], color: 0xe74c3c, hoist: true },
  { key: 'mod', name: '🔧 MOD', aliases: ['MOD', 'mod'], color: 0xe67e22, hoist: true },
  { key: 'member', name: '👤 正式成員', aliases: ['正式成員', '✅ 已驗證成員', '成員'], color: 0x95a5a6 },
  { key: 'guest', name: '👀 訪客', aliases: ['訪客', '👤 訪客'], color: 0x7f8c8d },
  { key: 'game', name: '🎮 遊戲玩家', aliases: ['遊戲玩家'], color: 0x3498db },
  { key: 'dev', name: '🧠 開發/AI', aliases: ['🛠 開發/AI', '開發/AI', '開發AI', '🧠 開發AI'], color: 0x9b59b6 },
  { key: 'invest', name: '📈 股票投資', aliases: ['股票投資'], color: 0x27ae60 },
  { key: 'creator', name: '🎨 創作者', aliases: ['🎨 設計創作', '創作者'], color: 0xe84393 },
  { key: 'night', name: '🌙 Night Crew', aliases: ['Night Crew'], color: 0x5b2c6f }
];

const CATEGORY_ORDER = [
  'entry',
  'lobby',
  'game_center',
  'popular_games',
  'player_games',
  'interests',
  'events',
  'admin'
];

const CATEGORIES = [
  {
    key: 'entry', name: '📌｜社群入口', aliases: ['社群入口'], permission: 'public_entry',
    channels: [
      ['welcome', '👋｜新人報到', CHANNEL_TYPES.TEXT],
      ['rules', '📜｜社群規則', CHANNEL_TYPES.TEXT],
      ['announcement', '📢｜公告', CHANNEL_TYPES.TEXT, 'public_readonly'],
      ['guide', '🧭｜伺服器導覽', CHANNEL_TYPES.TEXT, 'public_readonly'],
      ['roles', '✅｜身分組領取', CHANNEL_TYPES.TEXT],
      ['open_ticket', '🎫｜開啟客服單', CHANNEL_TYPES.TEXT]
    ]
  },
  {
    key: 'lobby', name: '💬｜社群大廳', aliases: ['公開大廳', '日常交流', '社群大廳'], permission: 'formal_member',
    channels: [
      ['general', '💭｜一般聊天', CHANNEL_TYPES.TEXT],
      ['late_night', '🌙｜深夜聊天', CHANNEL_TYPES.TEXT],
      ['life_share', '📷｜生活分享', CHANNEL_TYPES.TEXT],
      ['meme_share', '😂｜迷因分享', CHANNEL_TYPES.TEXT],
      ['night_lounge', '🎧｜掛機休息室', CHANNEL_TYPES.VOICE]
    ]
  },
  {
    key: 'game_center', name: '🎮｜遊戲中心', aliases: ['遊戲中心', '遊戲大廳'], permission: 'formal_member',
    channels: [
      ['lfg', '📢｜組隊招募', CHANNEL_TYPES.TEXT],
      ['voice_hub', '🎮｜目前語音房', CHANNEL_TYPES.TEXT, 'formal_readonly'],
      ['game_suggestions', '📋｜遊戲提議', CHANNEL_TYPES.TEXT],
      ['game_database', '🗃｜遊戲資料庫', CHANNEL_TYPES.TEXT],
      ['game_ranking', '📈｜熱門遊戲排行', CHANNEL_TYPES.TEXT]
    ]
  },
  { key: 'popular_games', name: '🔥｜熱門遊戲', aliases: ['熱門遊戲'], permission: 'game', channels: [] },
  { key: 'player_games', name: '🎲｜玩家遊戲區', aliases: ['其他遊戲', '玩家遊戲區'], permission: 'game', channels: [] },
  {
    key: 'interests', name: '🎨｜興趣交流', aliases: ['興趣交流'], permission: 'formal_member',
    channels: [
      ['music', '🎵｜音樂', CHANNEL_TYPES.TEXT],
      ['anime', '🎬｜動漫影劇', CHANNEL_TYPES.TEXT],
      ['photography', '📷｜攝影', CHANNEL_TYPES.TEXT],
      ['food', '🍜｜美食', CHANNEL_TYPES.TEXT],
      ['vehicles', '🏍｜汽機車', CHANNEL_TYPES.TEXT],
      ['travel', '✈️｜旅遊', CHANNEL_TYPES.TEXT],
      ['casual_voice', '🎤｜閒聊語音', CHANNEL_TYPES.VOICE],
      ['ai_tools', '🤖｜AI工具', CHANNEL_TYPES.TEXT, 'dev'],
      ['programming', '💻｜程式開發', CHANNEL_TYPES.TEXT, 'dev'],
      ['stocks', '📈｜股票投資', CHANNEL_TYPES.TEXT, 'invest'],
      ['finance', '💰｜理財交流', CHANNEL_TYPES.TEXT, 'invest']
    ]
  },
  {
    key: 'events', name: '🎉｜活動專區', aliases: ['活動專區'], permission: 'formal_member',
    channels: [
      ['giveaway', '🎁｜抽獎活動', CHANNEL_TYPES.TEXT],
      ['polls', '🗳｜投票區', CHANNEL_TYPES.TEXT],
      ['competition', '🏆｜比賽排行', CHANNEL_TYPES.TEXT],
      ['event_announcement', '📅｜活動公告', CHANNEL_TYPES.TEXT]
    ]
  },
  {
    key: 'admin', name: '🔒｜管理員後台', aliases: ['管理員後台'], permission: 'admin',
    channels: [
      ['server_logs', 'server-logs', CHANNEL_TYPES.TEXT],
      ['ticket_logs', 'ticket-logs', CHANNEL_TYPES.TEXT],
      ['bot_control', 'bot-control', CHANNEL_TYPES.TEXT],
      ['voice_control', '語音控制台', CHANNEL_TYPES.TEXT],
      ['organize_logs', '整理紀錄', CHANNEL_TYPES.TEXT]
    ]
  }
].map((category) => ({
  ...category,
  channels: category.channels.map(([key, name, type, permission]) => ({
    key,
    name,
    type,
    permission: permission || category.permission
  }))
}));

const GAME_CHANNELS = [
  { key: 'chat', name: '💬｜聊天', type: CHANNEL_TYPES.TEXT },
  { key: 'lfg', name: '🧑‍🤝‍🧑｜找隊友', type: CHANNEL_TYPES.TEXT },
  { key: 'info', name: '📌｜資訊', type: CHANNEL_TYPES.TEXT },
  { key: 'voice_create', name: '🔊｜➕｜建立語音', type: CHANNEL_TYPES.VOICE, userLimit: 1 }
];

const GAMES = [
  { id: 'league_of_legends', displayName: '英雄聯盟', tier: 'popular' },
  { id: 'teamfight_tactics', displayName: '聯盟戰棋', tier: 'popular' },
  { id: 'valorant', displayName: 'VALORANT', tier: 'popular' },
  { id: 'apex', displayName: 'APEX', tier: 'popular' },
  { id: 'minecraft', displayName: 'Minecraft', tier: 'popular' },
  { id: 'gtfo', displayName: 'GTFO', tier: 'player' },
  { id: 'overwatch_2', displayName: '鬥陣特攻2', tier: 'player' },
  { id: 'repo', displayName: 'R.E.P.O', tier: 'player' },
  { id: 'cs2', displayName: 'CS2', tier: 'player' },
  { id: 'project_zomboid', displayName: 'Project Zomboid', tier: 'player' }
];

const ONBOARDING = {
  nativeTaskChannelKeys: ['welcome', 'roles', 'guide', 'rules'],
  excludedNativeTaskChannelKeys: ['voice_hub', 'game_center', 'lobby'],
  prompt: '你加入科幻基地最想做什麼？',
  options: [
    { label: '🎮 找人一起玩遊戲', roleKeys: ['game', 'member'] },
    { label: '🌙 深夜聊天交朋友', roleKeys: ['member'] },
    { label: '🧠 AI / 程式開發交流', roleKeys: ['dev', 'member'] },
    { label: '📈 股票 / 投資討論', roleKeys: ['invest', 'member'] },
    { label: '🎨 分享作品與創作', roleKeys: ['creator', 'member'] },
    { label: '🤝 先看看再說', roleKeys: ['member'] }
  ]
};

const categories = CATEGORIES;
const channels = categories.flatMap((category) => category.channels.map((channel) => ({
  ...channel,
  categoryKey: category.key
})));
const visibility = Object.fromEntries(categories.map((category) => [category.key, category.permission]));
const protectedChannels = [
  'server-logs', 'ticket-logs', 'bot-control', '語音控制台', '整理紀錄',
  '遊戲提議', '目前語音房', '組隊招募'
];

module.exports = {
  CATEGORY_ORDER,
  CATEGORIES,
  GAMES,
  GAME_CHANNELS,
  ONBOARDING,
  ROLES,
  V3_VERSION,
  archiveRules: { mode: 'delete', enabled: false },
  categories,
  categoryOrder: CATEGORY_ORDER,
  channels,
  gameChannels: GAME_CHANNELS,
  gamePlacementRules: {
    popularTier: 'popular',
    dynamicTier: 'player',
    popularAnchorKey: 'popular_games',
    dynamicAnchorKey: 'player_games'
  },
  games: GAMES,
  onboarding: ONBOARDING,
  onboardingAllowedChannels: ONBOARDING.nativeTaskChannelKeys,
  protectedChannels,
  roles: ROLES,
  version: V3_VERSION,
  visibility
};
