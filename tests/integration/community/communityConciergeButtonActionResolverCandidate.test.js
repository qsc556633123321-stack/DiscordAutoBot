const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  COMMUNITY_CONCIERGE_BUTTON_ACTIONS,
  resolveCommunityConciergeButtonAction
} = require('../../fakes/community/FakeCommunityConciergeButtonActionResolver');

const expected = {
  concierge_games: 'games',
  concierge_invest: 'invest',
  concierge_dev: 'dev',
  concierge_night: 'night',
  concierge_bot: 'bot',
  concierge_roadmap: 'roadmap'
};
assert.deepEqual(COMMUNITY_CONCIERGE_BUTTON_ACTIONS, expected);
for (const [customId, action] of Object.entries(expected)) {
  assert.equal(resolveCommunityConciergeButtonAction(customId), action);
}
for (const value of ['concierge_unknown', 'concierge_games_extra', 'CONCIERGE_games', ' concierge_games', 'concierge_games ', 'foo', '', undefined, null, 0, true, {}, []]) {
  assert.equal(resolveCommunityConciergeButtonAction(value), null);
}
const source = fs.readFileSync(path.join(__dirname, '..', '..', 'fakes', 'community', 'FakeCommunityConciergeButtonActionResolver.js'), 'utf8');
for (const forbidden of ['discord.js', 'interaction', 'guild', 'member', 'reply(', 'EmbedBuilder', 'roles.add', 'CommunityRoleQuickAction']) {
  assert.equal(source.includes(forbidden), false, `resolver candidate must not depend on ${forbidden}`);
}
console.log('Community Concierge button action resolver candidate preserves exact semantic mapping and null-only unknown behavior.');
