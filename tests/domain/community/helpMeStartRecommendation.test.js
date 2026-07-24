const assert = require('node:assert/strict');
const { createHelpMeStartRecommendation } = require('../../../src/domain/community/helpMeStartRecommendation');
const { createChannel, standardChannels, toFacts } = require('../../fixtures/helpMeStartFakes');

const channels = toFacts();

function recommendation(answers, sourceChannels = channels) {
  return createHelpMeStartRecommendation({ answers, channels: sourceChannels }).recommendation;
}

assert.deepEqual(recommendation({ game: '', style: 'chat', onlineTime: 'mixed' }), {
  channels: ['<#1>', '<#2>', '<#7>'],
  roles: ['🍜 生活閒聊'],
  tips: ['可以先從一般聊天或深夜聊天開始露臉。']
});
assert.deepEqual(recommendation({ game: 'TFT', style: 'rank', onlineTime: 'mixed' }), {
  channels: ['<#3>', '<#4>'],
  roles: ['🎮 遊戲玩家', '🧑‍🤝‍🧑 找隊友通知'],
  tips: ['可以先搜尋或提議 `TFT` 的遊戲分類。', '你可能適合先看找隊友與 LFG 招募卡。']
});
assert.deepEqual(recommendation({ game: '', style: 'night', onlineTime: 'late' }).roles, ['🎮 遊戲玩家']);
assert.deepEqual(recommendation({ game: '', style: 'night', onlineTime: 'late' }).tips, [
  '如果常在 00:00-05:00 語音，之後會慢慢累積 Night Crew 資格。',
  '你的上線時間很適合深夜語音文化。'
]);
assert.deepEqual(recommendation({ game: '', style: 'tech', onlineTime: 'evening' }).roles, ['🛠 開發/AI']);
assert.deepEqual(recommendation({ game: '', style: 'tech', onlineTime: 'evening' }).tips, [
  '你可以到 AI / 開發入口分享工具、作品或專案。',
  '晚上通常是組隊與語音最容易成團的時段。'
]);
assert.deepEqual(recommendation({ game: '', style: 'rank', onlineTime: 'mixed' }).channels, ['<#1>', '<#4>', '<#7>']);
assert.deepEqual(recommendation({ game: '', style: 'rank', onlineTime: 'mixed' }).roles, ['🧑‍🤝‍🧑 找隊友通知']);
assert.deepEqual(recommendation({ game: '', style: 'rank', onlineTime: 'mixed' }).tips, ['你可能適合先看找隊友與 LFG 招募卡。']);

const moreThanEight = Array.from({ length: 10 }, (_, index) => createChannel(String(index + 20), `一般聊天-${index}`));
assert.equal(recommendation({ game: '', style: 'chat', onlineTime: 'mixed' }, toFacts(moreThanEight)).channels.length, 8);
const duplicateMentionFacts = [
  { id: 'same', name: '一般聊天', mention: '<#same>', isTextBased: true },
  { id: 'same-copy', name: '深夜聊天', mention: '<#same>', isTextBased: true }
];
assert.deepEqual(recommendation({ game: '', style: 'chat', onlineTime: 'mixed' }, duplicateMentionFacts).channels, ['<#same>']);
assert.deepEqual(recommendation({ game: '', style: 'rank', onlineTime: 'mixed' }, []).channels, []);
assert.throws(() => recommendation({ game: '[', style: 'rank', onlineTime: 'mixed' }), SyntaxError);
assert.equal(standardChannels.length, 8);
console.log('Help-me-start domain recommendation tests passed.');
