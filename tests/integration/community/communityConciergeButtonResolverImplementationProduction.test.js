const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  resolveCommunityConciergeButtonAction
} = require('../../../src/application/community/CommunityConciergeButtonActionResolver');

const root = path.resolve(__dirname, '..', '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const expected = Object.freeze({
  concierge_games: 'games',
  concierge_invest: 'invest',
  concierge_dev: 'dev',
  concierge_night: 'night',
  concierge_bot: 'bot',
  concierge_roadmap: 'roadmap'
});

for (const [customId, action] of Object.entries(expected)) {
  assert.equal(resolveCommunityConciergeButtonAction(customId), action);
}
assert.equal(resolveCommunityConciergeButtonAction('concierge_unknown'), null);
assert.match(runtime, /const action = resolveCommunityConciergeButtonAction\(interaction\.customId\);/);
for (const action of Object.values(expected)) assert.match(runtime, new RegExp(`action === '${action}'`));
assert.match(runtime, /action === 'invest' \|\| action === 'dev'/);
assert.match(runtime, /action: 'games'/);
assert.match(runtime, /action: kind/);
assert.match(runtime, /quickLinks\(guild, 'night'\)/);
assert.match(runtime, /buildRoadmapEmbed\(\)/);
assert.match(runtime, /return false;/);

console.log('Production Concierge semantic routing preserves role, presentation, and unknown-button branch behavior.');
