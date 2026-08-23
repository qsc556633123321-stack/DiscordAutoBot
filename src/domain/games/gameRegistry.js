const GAME_REGISTRY = [
  { id: 'valorant', displayName: 'VALORANT', aliases: ['特戰', '特戰英豪', '瓦羅蘭', 'valorant'], emoji: '🎯', tier: 'popular', layoutProfile: 'full' },
  { id: 'league_of_legends', displayName: '英雄聯盟', aliases: ['LOL', 'lol', 'league', '聯盟'], emoji: '⚔️', tier: 'popular', layoutProfile: 'full' },
  { id: 'teamfight_tactics', displayName: '聯盟戰棋', aliases: ['TFT', 'tft', '戰棋'], emoji: '♟️', tier: 'popular', layoutProfile: 'full' },
  { id: 'apex', displayName: 'APEX', aliases: ['apex legends'], emoji: '🔫', tier: 'popular', layoutProfile: 'full' },
  { id: 'minecraft', displayName: 'Minecraft', aliases: ['MC', 'mc', '麥塊'], emoji: '⛏️', tier: 'popular', layoutProfile: 'full' },
  { id: 'overwatch_2', displayName: '鬥陣特攻2', aliases: ['OW2', 'ow2', '鬥陣', '鬥陣特攻'], emoji: '🛡️', tier: 'other', layoutProfile: 'full' },
  { id: 'gtfo', displayName: 'GTFO', aliases: ['gtfo'], emoji: '🧟', tier: 'other', layoutProfile: 'full' },
  { id: 'repo', displayName: 'R.E.P.O', aliases: ['REPO', 'repo', 'R.E.P.O'], emoji: '🤖', tier: 'other', layoutProfile: 'full' },
  { id: 'cs2', displayName: 'CS2', aliases: ['Counter-Strike 2', 'Counter Strike 2', 'counter strike 2'], emoji: '🔫', tier: 'other', layoutProfile: 'full' },
  { id: 'project_zomboid', displayName: 'Project Zomboid', aliases: ['Zomboid', 'PZ'], emoji: '🧟', tier: 'other', layoutProfile: 'full' }
];

module.exports = Object.freeze(GAME_REGISTRY.map((game) => Object.freeze({ ...game })));
