const assert = require('node:assert/strict');
const {
  buildCommunityNonRoleConciergePresentationPayload
} = require('../../../src/modules/community/CommunityNonRoleConciergePresentation');

function embedJson(payload) {
  const result = payload.embeds[0].toJSON();
  delete result.timestamp;
  return result;
}

const night = buildCommunityNonRoleConciergePresentationPayload({
  action: 'night',
  links: ['<#night>', '<#voice>']
});
assert.deepEqual(Object.keys(night), ['embeds', 'ephemeral']);
assert.equal(night.ephemeral, true);
assert.deepEqual(embedJson(night), {
  color: 3092790,
  title: '🌙 深夜聊天室入口',
  description: '如果你常在 00:00-05:00 語音出沒，累積到一定程度會解鎖 Night Crew。',
  fields: [
    { name: '可以先去', value: '<#night>\n<#voice>', inline: false },
    { name: '怎麼開始', value: '看看目前語音房，或自己開一間「深夜聊天」Temp Voice。', inline: false }
  ]
});

const nightEmpty = buildCommunityNonRoleConciergePresentationPayload({ action: 'night' });
assert.equal(embedJson(nightEmpty).fields[0].value, '目前還沒有找到深夜入口。');

const bot = buildCommunityNonRoleConciergePresentationPayload({ action: 'bot' });
assert.equal(bot.ephemeral, true);
assert.equal(embedJson(bot).color, 5763719);
assert.equal(embedJson(bot).title, '🤖 Community OS 功能');
assert.match(embedJson(bot).description, /Temp Voice：自動建立臨時語音/);

let roadmapCalls = 0;
const roadmapEmbed = { id: 'roadmap-embed' };
const roadmap = buildCommunityNonRoleConciergePresentationPayload({
  action: 'roadmap',
  buildRoadmapEmbed: () => { roadmapCalls += 1; return roadmapEmbed; }
});
assert.equal(roadmapCalls, 1);
assert.deepEqual(roadmap, { embeds: [roadmapEmbed], ephemeral: true });

const sentinel = new Error('roadmap builder failed');
assert.throws(
  () => buildCommunityNonRoleConciergePresentationPayload({
    action: 'roadmap',
    buildRoadmapEmbed: () => { throw sentinel; }
  }),
  (error) => error === sentinel
);
assert.equal(buildCommunityNonRoleConciergePresentationPayload({ action: 'unknown' }), null);
console.log('Community non-role Concierge presentation builder preserves Night, Bot, Roadmap, throw-through, and unknown-action contracts.');
