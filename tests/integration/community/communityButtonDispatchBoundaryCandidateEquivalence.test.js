const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  dispatchCommunityConciergeButton,
  matchesCommunityConciergeButton
} = require('../../fakes/community/FakeCommunityConciergeButtonDispatchCandidate');

void (async () => {
  const root = path.resolve(__dirname, '..', '..', '..');
  const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
  const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');

  assert.match(legacy, /interaction\.customId\.startsWith\('concierge_'\)/);
  assert.match(legacy, /await handleConciergeButton\(interaction\)/);
  assert.match(legacy, /return;\s*\n\s*}\s*\n\s*\n\s*if \(interaction\.customId\.startsWith\('game_suggest_'/);
  for (const id of ['concierge_games', 'concierge_invest', 'concierge_dev', 'concierge_night', 'concierge_bot', 'concierge_roadmap']) {
    assert.equal(matchesCommunityConciergeButton(id), true);
  }
  assert.equal(matchesCommunityConciergeButton('unknown'), false);
  assert.equal(matchesCommunityConciergeButton('CONCIERGE_games'), false);
  assert.match(runtime, /id === 'concierge_games'/);
  assert.match(runtime, /id === 'concierge_night'/);
  assert.match(runtime, /id === 'concierge_bot'/);
  assert.match(runtime, /id === 'concierge_invest' \|\| id === 'concierge_dev'/);
  assert.match(runtime, /id === 'concierge_roadmap'/);
  assert.match(runtime, /return false;/);

  const interaction = { customId: 'concierge_unknown', replied: false, deferred: false };
  const result = await dispatchCommunityConciergeButton({
    interaction,
    handleConciergeButton: async () => false
  });
  assert.deepEqual(result, { matched: true, handlerReturn: false });
  assert.equal(Object.isFrozen(result), true);
  console.log('Community concierge dispatch candidate preserves prefix matching, handler routing, and ignored dispatcher return values.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
