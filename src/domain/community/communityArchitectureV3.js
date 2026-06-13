const { ChannelType } = require('discord.js');

const V3_VERSION = '3.0.0';

const ROLES = [
  { key: 'owner', name: '👑 站長', aliases: ['站長'], color: 0xf1c40f, hoist: true },
  { key: 'admin', name: '🛡 管理員', aliases: ['管理員'], color: 0xe74c3c, hoist: true },
  { key: 'mod', name: '🔧 MOD', aliases: ['MOD', 'mod'], color: 0xe67e22, hoist: true },
  { key: 'member', name: '👤 正式成員', aliases: ['正式成員', '✅ 已驗證成員', '成員'], color: 0x95a5a6 },
  { key: 'guest', name: '👀 訪客', aliases: ['訪客', '👤 訪客'], color: 0x7f8c8d },
  { key: 'game', name: '🎮 遊戲玩家', aliases: ['遊戲玩家'], color: 0x3498db },
  { key: 'dev', name: '🧠 開發/AI', aliases: ['🛠 開發/AI', '開發/AI'], color: 0x9b59b6 },
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
  'knowledge',
  'night_crew',
  'events',
  'support',
  'admin',
  'game_archive',
  'old_archive'
];

const CATEGORIES = [
  {
    key: 'entry', name: '📌｜社群入口', aliases: ['社群入口'], permission: 'public_entry',
    channels: [
      ['welcome', '👋｜新人報到', ChannelType.GuildText],
      ['rules', '📜｜社群規則', ChannelType.GuildText],
      ['announcement', '📢｜公告', ChannelType.GuildText, 'public_readonly'],
      ['guide', '🧭｜伺服器導覽', ChannelType.GuildText, 'public_readonly'],
      ['roles', '✅｜身分組領取', ChannelType.GuildText]
    ]
  },
  {
    key: 'lobby', name: '💬｜社群大廳', aliases: ['公開大廳', '日常交流', '社群大廳'], permission: 'formal_member',
    channels: [
      ['general', '💭｜一般聊天', ChannelType.GuildText],
      ['late_night', '🌙｜深夜聊天', ChannelType.GuildText],
      ['casual_voice', '🎤｜閒聊語音', ChannelType.GuildVoice],
      ['life_share', '📷｜生活分享', ChannelType.GuildText],
      ['meme_share', '😂｜迷因分享', ChannelType.GuildText]
    ]
  },
  {
    key: 'game_center', name: '🎮｜遊戲中心', aliases: ['遊戲中心', '遊戲大廳'], permission: 'formal_member',
    channels: [
      ['lfg', '📢｜組隊招募', ChannelType.GuildText],
      ['voice_hub', '🎮｜目前語音房', ChannelType.GuildText, 'formal_readonly'],
      ['game_suggestions', '📋｜遊戲提議', ChannelType.GuildText],
      ['game_database', '🗃｜遊戲資料庫', ChannelType.GuildText],
      ['game_ranking', '📈｜熱門遊戲排行', ChannelType.GuildText]
    ]
  },
  { key: 'popular_games', name: '🔥｜熱門遊戲', aliases: ['熱門遊戲'], permission: 'formal_member', channels: [] },
  { key: 'player_games', name: '🎲｜玩家遊戲區', aliases: ['其他遊戲', '玩家遊戲區'], permission: 'formal_member', channels: [] },
  {
    key: 'interests', name: '🎨｜興趣交流', aliases: ['興趣交流'], permission: 'formal_member',
    channels: [
      ['music', '🎵｜音樂', ChannelType.GuildText],
      ['anime', '🎬｜動漫影劇', ChannelType.GuildText],
      ['photography', '📷｜攝影', ChannelType.GuildText],
      ['food', '🍜｜美食', ChannelType.GuildText],
      ['vehicles', '🏍｜汽機車', ChannelType.GuildText],
      ['travel', '✈️｜旅遊', ChannelType.GuildText]
    ]
  },
  {
    key: 'knowledge', name: '🧠｜知識交流', aliases: ['創作與開發', '投資討論', '知識交流'], permission: 'knowledge',
    channels: [
      ['ai_tools', '🤖｜AI工具', ChannelType.GuildText, 'dev'],
      ['programming', '💻｜程式開發', ChannelType.GuildText, 'dev'],
      ['stocks', '📈｜股票投資', ChannelType.GuildText, 'invest'],
      ['finance', '💰｜理財交流', ChannelType.GuildText, 'invest'],
      ['learning', '📚｜學習資源', ChannelType.GuildText, 'knowledge']
    ]
  },
  {
    key: 'night_crew', name: '🌙｜Night Crew', aliases: ['Night Crew'], permission: 'night',
    channels: [
      ['night_chat', '🌙｜夜貓聊天', ChannelType.GuildText],
      ['night_lounge', '🎧｜掛機休息室', ChannelType.GuildVoice],
      ['night_cafe', '☕｜凌晨茶水間', ChannelType.GuildText]
    ]
  },
  {
    key: 'events', name: '🎉｜活動專區', aliases: ['活動專區'], permission: 'formal_member',
    channels: [
      ['giveaway', '🎁｜抽獎活動', ChannelType.GuildText],
      ['polls', '🗳｜投票區', ChannelType.GuildText],
      ['competition', '🏆｜比賽排行', ChannelType.GuildText],
      ['event_announcement', '📅｜活動公告', ChannelType.GuildText]
    ]
  },
  {
    key: 'support', name: '🎫｜客服支援', aliases: ['客服支援'], permission: 'public_entry',
    channels: [
      ['open_ticket', '🎫｜開啟客服單', ChannelType.GuildText],
      ['bug_report', '🐞｜問題回報', ChannelType.GuildText],
      ['suggestions', '💡｜建議區', ChannelType.GuildText]
    ]
  },
  {
    key: 'admin', name: '🔒｜管理員後台', aliases: ['管理員後台'], permission: 'admin',
    channels: [
      ['server_logs', 'server-logs', ChannelType.GuildText],
      ['ticket_logs', 'ticket-logs', ChannelType.GuildText],
      ['bot_control', 'bot-control', ChannelType.GuildText],
      ['voice_control', '語音控制台', ChannelType.GuildText],
      ['organize_logs', '整理紀錄', ChannelType.GuildText]
    ]
  },
  { key: 'game_archive', name: '📦｜遊戲封存區', aliases: ['遊戲封存區'], permission: 'archive', channels: [] },
  { key: 'old_archive', name: '📦｜舊頻道封存', aliases: ['舊頻道封存', '舊頻道封存區'], permission: 'archive', channels: [] }
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
  { key: 'chat', name: '💬｜聊天', type: ChannelType.GuildText },
  { key: 'lfg', name: '🧑‍🤝‍🧑｜找隊友', type: ChannelType.GuildText },
  { key: 'info', name: '📌｜資訊', type: ChannelType.GuildText },
  { key: 'voice_create', name: '🔊｜➕｜建立語音', type: ChannelType.GuildVoice, userLimit: 1 }
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
  archiveRules: { neverDelete: true, oldCategoryKey: 'old_archive', gameCategoryKey: 'game_archive' },
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
