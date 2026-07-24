const guideContent = {
  defaultGuildName: 'KU Community',
  fallbackIntro: '這裡是 🌙 深夜遊戲與語音社群。',
  titlePrefix: '👋 歡迎來到',
  color: 0x5865f2,
  sections: [{
    title: '你可以：',
    items: [
      '🎮 找人打遊戲', '🎧 建立臨時語音房', '🌙 深夜掛語音聊天', '💬 在一般聊天輕鬆打招呼',
      '🧠 在認真討論交換較深入的想法', '🤖 體驗 AI 社群功能', '📈 討論股票與科技',
      '🧑‍💻 分享開發與創作', '📋 提議你想玩的新遊戲分類'
    ]
  }],
  footer: '不用急著看完，慢慢探索就好。',
  actions: [
    { id: 'concierge_games', label: '我想玩遊戲', emoji: '🎮', style: 'primary', disabled: false },
    { id: 'panel_show_game_suggestions', label: '提議新遊戲', emoji: '📋', style: 'secondary', disabled: false },
    { id: 'concierge_bot', label: 'BOT 有什麼功能？', emoji: '🤖', style: 'secondary', disabled: false },
    { id: 'concierge_night', label: '我喜歡深夜聊天', emoji: '🌙', style: 'secondary', disabled: false },
    { id: 'concierge_invest', label: '我對投資有興趣', emoji: '📈', style: 'secondary', disabled: false },
    { id: 'concierge_dev', label: '我想看 AI / 開發', emoji: '🧑‍💻', style: 'secondary', disabled: false },
    { id: 'concierge_roadmap', label: '社群未來規劃', emoji: '🚧', style: 'secondary', disabled: false }
  ]
};

const guildFacts = { id: 'guild-1', name: 'Test Guild', channels: [{ id: 'guide-channel', name: '🧭｜伺服器導覽' }] };
const guideViewModel = {
  guide: {
    color: 0x5865f2,
    title: '👋 歡迎來到 Test Guild',
    intro: guideContent.fallbackIntro,
    sections: guideContent.sections,
    footer: guideContent.footer
  },
  actions: guideContent.actions
};
const embedWithoutTimestamp = {
  color: 0x5865f2,
  title: '👋 歡迎來到 Test Guild',
  description: `${guideContent.fallbackIntro}\n\n你可以：\n${guideContent.sections[0].items.join('\n')}`,
  footer: { text: guideContent.footer }
};
const componentPayload = [
  { type: 1, components: guideContent.actions.slice(0, 3).map((action) => ({ type: 2, custom_id: action.id, label: action.label, style: action.style === 'primary' ? 1 : 2, emoji: { id: undefined, name: action.emoji, animated: false }, disabled: false })) },
  { type: 1, components: guideContent.actions.slice(3).map((action) => ({ type: 2, custom_id: action.id, label: action.label, style: 2, emoji: { id: undefined, name: action.emoji, animated: false }, disabled: false })) }
];
const statusRecord = { guideChannelId: 'guide-channel', guideMessageId: 'guide-message', roadmapChannelId: 'missing-channel', roadmapMessageId: 'roadmap-message' };
const statusViewModel = { ...statusRecord, guideChannelFound: true, roadmapChannelFound: false };

module.exports = { componentPayload, embedWithoutTimestamp, guideContent, guideViewModel, guildFacts, statusRecord, statusViewModel };
