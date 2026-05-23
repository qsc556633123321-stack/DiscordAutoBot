const ROLE_DESIGN = [
  { name: '👑 站長', aliases: ['站長'], color: '#F1C40F', hoist: true, mentionable: false, group: '管理層' },
  { name: '🛡 管理員', aliases: ['管理員'], color: '#E74C3C', hoist: true, mentionable: false, group: '管理層' },
  { name: '🔧 MOD', aliases: ['MOD', 'mod'], color: '#E67E22', hoist: true, mentionable: false, group: '管理層' },
  { name: '👤 訪客', aliases: ['訪客'], color: '#95A5A6', hoist: false, mentionable: false, group: '安全與狀態' },
  { name: '✅ 已驗證成員', aliases: ['已驗證成員', '成員'], color: '#2ECC71', hoist: false, mentionable: false, group: '安全與狀態' },
  { name: '🧊 靜音/限制', aliases: ['靜音/限制', 'Muted', 'muted'], color: '#7F8C8D', hoist: false, mentionable: false, group: '安全與狀態' },
  { name: '🎮 遊戲玩家', aliases: ['遊戲玩家'], color: '#3498DB', hoist: true, mentionable: false, group: '興趣身分組' },
  { name: '🧑‍🤝‍🧑 找隊友通知', aliases: ['找隊友通知'], color: '#1ABC9C', hoist: false, mentionable: false, group: '興趣身分組' },
  { name: '📈 股票投資', aliases: ['股票投資'], color: '#27AE60', hoist: true, mentionable: false, group: '興趣身分組' },
  { name: '🛠 開發/AI', aliases: ['開發/AI'], color: '#9B59B6', hoist: true, mentionable: false, group: '興趣身分組' },
  { name: '🎨 設計創作', aliases: ['設計創作'], color: '#E84393', hoist: true, mentionable: false, group: '興趣身分組' },
  { name: '🍜 生活閒聊', aliases: ['生活閒聊'], color: '#F39C12', hoist: false, mentionable: false, group: '興趣身分組' },
  { name: '📢 公告通知', aliases: ['公告通知'], color: '#F4D03F', hoist: false, mentionable: false, group: '興趣身分組' },
  { name: '🎉 活動通知', aliases: ['活動通知'], color: '#FF7675', hoist: false, mentionable: false, group: '興趣身分組' }
];

module.exports = {
  ROLE_DESIGN
};
