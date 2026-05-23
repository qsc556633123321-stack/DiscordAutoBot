module.exports = {
  publicCategories: [
    '📌｜社群入口',
    '🎫｜客服支援'
  ],
  publicChannels: [
    '📜｜社群規則',
    '📢｜公告',
    '✅｜身分組領取',
    '👋｜新人報到',
    '🧭｜伺服器導覽',
    '🎟｜開啟客服單'
  ],
  roleAccess: [
    {
      roleName: '✅ 已驗證成員',
      categories: ['💬｜公開大廳', '🎮｜遊戲大廳']
    },
    {
      roleName: '🎮 遊戲玩家',
      categories: ['💬｜公開大廳', '🎮｜遊戲大廳', '🎮｜聯盟戰棋', '🎮｜英雄聯盟', '🎮｜APEX', '🎮｜特戰英豪']
    },
    {
      roleName: '📈 股票投資',
      categories: ['💬｜公開大廳', '📈｜投資討論']
    },
    {
      roleName: '🛠 開發/AI',
      categories: ['💬｜公開大廳', '🛠｜創作與開發']
    },
    {
      roleName: '🎨 設計創作',
      categories: ['💬｜公開大廳', '🛠｜創作與開發']
    },
    {
      roleName: '🍜 生活閒聊',
      categories: ['💬｜公開大廳']
    }
  ],
  adminRoles: ['👑 站長', '🛡 管理員', '🔧 MOD', '站長', '管理員']
};
