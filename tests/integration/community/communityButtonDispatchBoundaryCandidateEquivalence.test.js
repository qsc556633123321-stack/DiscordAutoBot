const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  dispatchCommunityConciergeButton,
  matchesCommunityConciergeButton
} = require('../../fakes/community/FakeCommunityConciergeButtonDispatchCandidate');
const {
  resolveCommunityConciergeButtonAction
} = require('../../../src/application/community/CommunityConciergeButtonActionResolver');

void (async () => {
  const root = path.resolve(__dirname, '..', '..', '..');
  const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
  const handler = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonHandlers', 'communityConciergeButtons.js'), 'utf8');
  const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');

  assert.equal(legacy.includes("startsWith('concierge_')"), false);
  assert.equal(legacy.includes('handleConciergeButton'), false);
  assert.match(handler, /customId\.startsWith\(CONCIERGE_PREFIX\)/);
  assert.match(handler, /await handleConciergeButton\(interaction\)/);
  assert.match(legacy, /return;\s*\n\s*}\s*\n\s*\n\s*if \(interaction\.customId\.startsWith\('game_suggest_'/);
  for (const id of ['concierge_games', 'concierge_invest', 'concierge_dev', 'concierge_night', 'concierge_bot', 'concierge_roadmap']) {
    assert.equal(matchesCommunityConciergeButton(id), true);
  }
  assert.equal(matchesCommunityConciergeButton('unknown'), false);
  assert.equal(matchesCommunityConciergeButton('CONCIERGE_games'), false);
  assert.match(runtime, /resolveCommunityConciergeButtonAction\(interaction\.customId\)/);
  for (const [id, action] of Object.entries({
    concierge_games: 'games',
    concierge_invest: 'invest',
    concierge_dev: 'dev',
    concierge_night: 'night',
    concierge_bot: 'bot',
    concierge_roadmap: 'roadmap'
  })) {
    assert.equal(resolveCommunityConciergeButtonAction(id), action);
    assert.equal(runtime.includes(id), false);
  }
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
