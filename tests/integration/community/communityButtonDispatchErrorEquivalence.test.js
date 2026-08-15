const assert = require('node:assert/strict');
const {
  GENERIC_FAILURE_PAYLOAD,
  dispatchCommunityConciergeButton
} = require('../../fakes/community/FakeCommunityConciergeButtonDispatchCandidate');

function createInteraction({ replied = false, deferred = false } = {}) {
  const replies = [];
  return {
    customId: 'concierge_games',
    replied,
    deferred,
    replies,
    async reply(payload) { replies.push(payload); this.replied = true; }
  };
}

void (async () => {
  for (const state of [
    { name: 'before reply', replied: false, deferred: false, expectedReplies: 1 },
    { name: 'after reply', replied: true, deferred: false, expectedReplies: 0 },
    { name: 'after defer', replied: false, deferred: true, expectedReplies: 0 }
  ]) {
    const interaction = createInteraction(state);
    const logs = [];
    const result = await dispatchCommunityConciergeButton({
      interaction,
      handleConciergeButton: async () => { throw new Error(state.name); },
      logError: (...args) => logs.push(args)
    });
    assert.deepEqual(result, { matched: true, handlerReturn: undefined });
    assert.equal(logs.length, 1);
    assert.equal(logs[0][0], 'Concierge button failed:');
    assert.equal(interaction.replies.length, state.expectedReplies);
    if (state.expectedReplies) assert.deepEqual(interaction.replies[0], GENERIC_FAILURE_PAYLOAD);
  }
  console.log('Community concierge dispatch candidate preserves legacy catch, reply-state, and swallowed-error semantics.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
