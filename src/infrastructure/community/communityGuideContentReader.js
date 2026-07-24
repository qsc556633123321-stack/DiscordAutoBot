const GUIDE_CONTENT = Object.freeze({
  defaultGuildName: 'KU Community',
  fallbackIntro: '這裡是 🌙 深夜遊戲與語音社群。',
  titlePrefix: '👋 歡迎來到',
  color: 0x5865f2,
  sections: [
    {
      title: '你可以：',
      items: [
        '🎮 找人打遊戲',
        '🎧 建立臨時語音房',
        '🌙 深夜掛語音聊天',
        '💬 在一般聊天輕鬆打招呼',
        '🧠 在認真討論交換較深入的想法',
        '🤖 體驗 AI 社群功能',
        '📈 討論股票與科技',
        '🧑‍💻 分享開發與創作',
        '📋 提議你想玩的新遊戲分類'
      ]
    }
  ],
  footer: '不用急著看完，慢慢探索就好。',
  actions: [
    { id: 'concierge_games', label: '我想玩遊戲', emoji: '🎮', style: 'primary' },
    { id: 'panel_show_game_suggestions', label: '提議新遊戲', emoji: '📋', style: 'secondary' },
    { id: 'concierge_bot', label: 'BOT 有什麼功能？', emoji: '🤖', style: 'secondary' },
    { id: 'concierge_night', label: '我喜歡深夜聊天', emoji: '🌙', style: 'secondary' },
    { id: 'concierge_invest', label: '我對投資有興趣', emoji: '📈', style: 'secondary' },
    { id: 'concierge_dev', label: '我想看 AI / 開發', emoji: '🧑‍💻', style: 'secondary' },
    { id: 'concierge_roadmap', label: '社群未來規劃', emoji: '🚧', style: 'secondary' }
  ]
});

function createCommunityGuideContentReader({ content = GUIDE_CONTENT } = {}) {
  return {
    async readGuideContent() {
      return content;
    }
  };
}

module.exports = { GUIDE_CONTENT, createCommunityGuideContentReader };
