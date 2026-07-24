const commandMetadata = {
  options: [
    { type: 3, name: 'game', description: '你通常玩什麼？例如 TFT、LOL、APEX、Minecraft', required: false, max_length: 80 },
    {
      type: 3,
      name: 'style',
      description: '你比較喜歡哪種社群玩法？',
      required: false,
      choices: [
        { name: '上分', value: 'rank' },
        { name: '閒聊', value: 'chat' },
        { name: '深夜掛語音', value: 'night' },
        { name: '技術討論', value: 'tech' }
      ]
    },
    {
      type: 3,
      name: 'online_time',
      description: '你通常幾點上線？',
      required: false,
      choices: [
        { name: '白天', value: 'day' },
        { name: '晚上', value: 'evening' },
        { name: '深夜', value: 'late' },
        { name: '不固定', value: 'mixed' }
      ]
    }
  ],
  name: 'help-me-start',
  description: '用幾個問題快速推薦你該去哪裡開始',
  type: 1
};

const fallback = '我會建議你先領對身分組，再去目前語音房或找隊友大廳看看。';
const deferredReply = { ephemeral: true };
const answers = { game: 'TFT', style: 'rank', onlineTime: 'late' };
const recommendation = {
  channels: ['<#3>', '<#4>'],
  roles: ['🎮 遊戲玩家', '🧑‍🤝‍🧑 找隊友通知'],
  tips: [
    '可以先搜尋或提議 `TFT` 的遊戲分類。',
    '你可能適合先看找隊友與 LFG 招募卡。',
    '你的上線時間很適合深夜語音文化。'
  ]
};
const aiContext = { guildName: 'Test Guild', answers, recommendation };
const embedWithoutTimestamp = {
  color: 0x5865f2,
  title: '🧭 你的快速開始路線',
  description: fallback,
  fields: [
    { name: '推薦頻道', value: '<#3>\n<#4>', inline: false },
    { name: '建議身分組', value: '🎮 遊戲玩家\n🧑‍🤝‍🧑 找隊友通知', inline: false },
    { name: '開始方式', value: '可以先搜尋或提議 `TFT` 的遊戲分類。\n你可能適合先看找隊友與 LFG 招募卡。\n你的上線時間很適合深夜語音文化。', inline: false }
  ],
  footer: { text: '這只是起點，你可以慢慢調整自己的社群路線。' }
};

module.exports = {
  aiContext,
  answers,
  commandMetadata,
  deferredReply,
  embedWithoutTimestamp,
  fallback,
  recommendation
};
