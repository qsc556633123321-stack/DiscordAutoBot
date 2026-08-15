const assert = require('node:assert/strict');
const {
  buildCommunityRoleConciergePresentationPayload
} = require('../../../src/modules/community/CommunityRoleConciergePresentation');

function normalize(payload) {
  return { embeds: payload.embeds.map((embed) => embed.toJSON()), ephemeral: payload.ephemeral };
}

for (const [action, trueText, falseText, emptyText] of [
  ['games', '已幫你加入 🎮 遊戲玩家。', '如果還看不到遊戲分類，請按「領取身分組」。', '目前還沒有找到遊戲入口頻道。'],
  ['invest', '已幫你加入 📈 股票投資。', '你可以先領取 📈 股票投資 身分組解鎖相關分類。', '目前還沒有找到相關入口。'],
  ['dev', '已幫你加入 🛠 開發/AI。', '你可以先領取 🛠 開發/AI 身分組解鎖相關分類。', '目前還沒有找到相關入口。']
]) {
  const added = normalize(buildCommunityRoleConciergePresentationPayload({ action, added: true, links: ['<#one>'] }));
  const missing = normalize(buildCommunityRoleConciergePresentationPayload({ action, added: false, links: ['<#one>'] }));
  const empty = normalize(buildCommunityRoleConciergePresentationPayload({ action, added: false, links: [] }));
  assert.equal(added.ephemeral, true);
  assert.equal(missing.ephemeral, true);
  assert.equal(JSON.stringify(added), JSON.stringify(added));
  assert.match(JSON.stringify(added), new RegExp(trueText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(JSON.stringify(missing), new RegExp(falseText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(JSON.stringify(empty), new RegExp(emptyText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
}

const sentinel = new Error('presentation sentinel');
assert.throws(
  () => buildCommunityRoleConciergePresentationPayload({ action: 'games', added: true, links: { join: () => { throw sentinel; } } }),
  (error) => error === sentinel
);
assert.equal(buildCommunityRoleConciergePresentationPayload({ action: 'unknown', added: true }), null);
console.log('Community role Concierge presentation builder preserves all frozen payload variants.');
