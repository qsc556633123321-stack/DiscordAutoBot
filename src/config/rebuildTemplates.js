const mixedCommunity = {
  name: 'mixed_community',
  label: '混合社群',
  categories: [
    {
      name: '📌｜社群入口',
      channels: [
        { name: '📜｜社群規則', type: 'text' },
        { name: '📢｜公告', type: 'text' },
        { name: '✅｜身分組領取', type: 'text' },
        { name: '👋｜新人報到', type: 'text' },
        { name: '🧭｜伺服器導覽', type: 'text' }
      ]
    },
    {
      name: '💬｜公開大廳',
      channels: [
        { name: '💬｜一般聊天', type: 'text' },
        { name: '🎮｜找隊友大廳', type: 'text' },
        { name: '📅｜活動公告', type: 'text' },
        { name: '🖼｜好圖分享', type: 'text' }
      ]
    },
    {
      name: '🎮｜聯盟戰棋',
      channels: [
        { name: '💬｜tft-聊天', type: 'text' },
        { name: '🧑‍🤝‍🧑｜tft-找隊友', type: 'text' },
        { name: '🏆｜tft-戰績分享', type: 'text' },
        { name: '📌｜tft-資訊', type: 'text' },
        { name: '➕｜建立聯盟戰棋語音', type: 'voice', userLimit: 1 }
      ]
    },
    {
      name: '🎮｜APEX',
      channels: [
        { name: '💬｜apex-聊天', type: 'text' },
        { name: '🧑‍🤝‍🧑｜apex-找隊友', type: 'text' },
        { name: '🏆｜apex-戰績分享', type: 'text' },
        { name: '📌｜apex-資訊', type: 'text' },
        { name: '➕｜建立APEX語音', type: 'voice', userLimit: 1 }
      ]
    },
    {
      name: '🎮｜LOL',
      channels: [
        { name: '💬｜lol-聊天', type: 'text' },
        { name: '🧑‍🤝‍🧑｜lol-找隊友', type: 'text' },
        { name: '🏆｜lol-戰績分享', type: 'text' },
        { name: '📌｜lol-資訊', type: 'text' },
        { name: '➕｜建立LOL語音', type: 'voice', userLimit: 1 }
      ]
    },
    {
      name: '🎮｜Minecraft',
      channels: [
        { name: '💬｜mc-聊天', type: 'text' },
        { name: '🧑‍🤝‍🧑｜mc-找隊友', type: 'text' },
        { name: '🏗｜mc-建築分享', type: 'text' },
        { name: '📌｜mc-伺服器資訊', type: 'text' },
        { name: '➕｜建立MC語音', type: 'voice', userLimit: 1 }
      ]
    },
    {
      name: '🛠｜創作與開發',
      channels: [
        { name: '🧑‍💻｜程式開發', type: 'text' },
        { name: '🤖｜AI工具', type: 'text' },
        { name: '🎨｜設計作品', type: 'text' },
        { name: '📁｜作品展示', type: 'text' },
        { name: '🧪｜專案測試', type: 'text' }
      ]
    },
    {
      name: '📈｜投資討論',
      channels: [
        { name: '📊｜台股討論', type: 'text' },
        { name: '📈｜盤勢觀察', type: 'text' },
        { name: '🧠｜投資筆記', type: 'text' },
        { name: '🤖｜股票AI工具', type: 'text' }
      ]
    },
    {
      name: '🎉｜活動專區',
      channels: [
        { name: '🗳｜投票區', type: 'text' },
        { name: '🎁｜抽獎活動', type: 'text' },
        { name: '🏆｜比賽與排行', type: 'text' }
      ]
    },
    {
      name: '🎫｜客服支援',
      channels: [
        { name: '🎟｜開啟客服單', type: 'text' },
        { name: '🐞｜問題回報', type: 'text' },
        { name: '💡｜建議區', type: 'text' }
      ]
    },
    {
      name: '🔒｜管理員後台',
      adminOnly: true,
      channels: [
        { name: '🔒｜管理員頻道', type: 'text' },
        { name: '📑｜server-logs', type: 'text' },
        { name: '📑｜ticket-logs', type: 'text' },
        { name: '🧹｜整理紀錄', type: 'text' },
        { name: '⚙️｜bot-control', type: 'text' }
      ]
    },
    {
      name: '📦｜舊頻道封存',
      channels: []
    }
  ]
};

module.exports = {
  gaming_community: mixedCommunity,
  creator_community: mixedCommunity,
  mixed_community: mixedCommunity
};
