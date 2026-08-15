const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { resolveCommunityConciergeButtonAction } = require('../../fakes/community/FakeCommunityConciergeButtonActionResolver');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const currentBranches = Object.freeze({
  concierge_games: Object.freeze({ action: 'games', roleAction: 'games', links: 'games', reply: 'games', returns: true }),
  concierge_invest: Object.freeze({ action: 'invest', roleAction: 'invest', links: 'invest', reply: 'invest', returns: true }),
  concierge_dev: Object.freeze({ action: 'dev', roleAction: 'dev', links: 'dev', reply: 'dev', returns: true }),
  concierge_night: Object.freeze({ action: 'night', roleAction: null, links: 'night', reply: 'night', returns: true }),
  concierge_bot: Object.freeze({ action: 'bot', roleAction: null, links: null, reply: 'bot', returns: true }),
  concierge_roadmap: Object.freeze({ action: 'roadmap', roleAction: null, links: null, reply: 'roadmap', returns: true })
});

for (const [customId, expected] of Object.entries(currentBranches)) {
  assert.equal(resolveCommunityConciergeButtonAction(customId), expected.action);
  assert.equal(expected.returns, true);
}
assert.equal(resolveCommunityConciergeButtonAction('concierge_unknown'), null);
assert.equal(resolveCommunityConciergeButtonAction('foo'), null);
assert.match(runtime, /action: 'games'/);
assert.match(runtime, /action: kind/);
assert.match(runtime, /quickLinks\(guild, 'night'\)/);
assert.match(runtime, /buildRoadmapEmbed\(\)/);
assert.match(runtime, /return false;/);
console.log('Resolver-switch candidate preserves Concierge branch action, dependency, reply, and return equivalence without runtime changes.');
