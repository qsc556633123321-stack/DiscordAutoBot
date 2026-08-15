const assert = require('node:assert/strict');
const {
  COMMUNITY_CONCIERGE_BUTTON_ACTIONS,
  resolveCommunityConciergeButtonAction
} = require('../../../src/application/community/CommunityConciergeButtonActionResolver');

const expected = Object.freeze({
  concierge_games: 'games',
  concierge_invest: 'invest',
  concierge_dev: 'dev',
  concierge_night: 'night',
  concierge_bot: 'bot',
  concierge_roadmap: 'roadmap'
});

assert.deepEqual(COMMUNITY_CONCIERGE_BUTTON_ACTIONS, expected);
for (const [customId, action] of Object.entries(expected)) {
  assert.equal(resolveCommunityConciergeButtonAction(customId), action);
}
for (const value of ['concierge_unknown', 'concierge_games_extra', 'CONCIERGE_games', ' concierge_games', 'concierge_games ', 'foo', '', undefined, null, 0, true, {}, []]) {
  assert.equal(resolveCommunityConciergeButtonAction(value), null);
}

console.log('Community Concierge button action resolver preserves exact semantic mapping and null-only unknown behavior.');
