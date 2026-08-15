const assert = require('node:assert/strict');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..', '..');
const conciergeHandlerPath = path.join(root, 'src', 'modules', 'interactions', 'buttonHandlers', 'communityConciergeButtons.js');
const conciergeRuntimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const buttonHandlerPath = path.join(root, 'src', 'modules', 'interactions', 'buttonInteractionHandler.js');
const legacyDispatcherPath = path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionDispatcher.js');

function withConciergeHandler(handleConciergeButton, run) {
  const originalRuntime = require(conciergeRuntimePath);
  const originalCache = require.cache[conciergeRuntimePath].exports;
  require.cache[conciergeRuntimePath].exports = { ...originalRuntime, handleConciergeButton };
  delete require.cache[conciergeHandlerPath];
  try {
    return run(require(conciergeHandlerPath));
  } finally {
    delete require.cache[conciergeHandlerPath];
    require.cache[conciergeRuntimePath].exports = originalCache;
  }
}

async function withButtonRouter({ conciergeButtons, executeLegacy }, run) {
  const originalConcierge = require(conciergeHandlerPath);
  const originalDispatcher = require(legacyDispatcherPath);
  require.cache[conciergeHandlerPath].exports = conciergeButtons;
  require.cache[legacyDispatcherPath].exports = { ...originalDispatcher, execute: executeLegacy };
  delete require.cache[buttonHandlerPath];
  try {
    return await run(require(buttonHandlerPath));
  } finally {
    delete require.cache[buttonHandlerPath];
    require.cache[conciergeHandlerPath].exports = originalConcierge;
    require.cache[legacyDispatcherPath].exports = originalDispatcher;
  }
}

async function captureConsoleErrors(run) {
  const originalError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args);
  try {
    await run(errors);
  } finally {
    console.error = originalError;
  }
}

void (async () => {
  for (const result of [true, false, undefined]) {
    await withConciergeHandler(async () => result, async ({ handle }) => {
      const interaction = { customId: 'concierge_unknown', replied: false, deferred: false, reply: async () => assert.fail('unexpected reply') };
      assert.equal(await handle(interaction), undefined);
    });
  }

  await captureConsoleErrors(async (errors) => {
    await withConciergeHandler(async () => { throw new Error('before reply'); }, async ({ handle }) => {
      const replies = [];
      const interaction = { customId: 'concierge_games', replied: false, deferred: false, async reply(payload) { replies.push(payload); this.replied = true; } };
      assert.equal(await handle(interaction), undefined);
      assert.deepEqual(replies, [{ content: '處理互動導覽時發生錯誤，請稍後再試。', ephemeral: true }]);
    });

    for (const state of [{ replied: true, deferred: false }, { replied: false, deferred: true }]) {
      await withConciergeHandler(async () => { throw new Error('after response'); }, async ({ handle }) => {
      const interaction = { customId: 'concierge_games', ...state, reply: async () => assert.fail('unexpected fallback reply') };
      assert.equal(await handle(interaction), undefined);
      });
    }
    assert.equal(errors.length, 3);
    for (const [message] of errors) assert.equal(message, 'Concierge button failed:');
  });

  const knownIds = ['concierge_games', 'concierge_invest', 'concierge_dev', 'concierge_night', 'concierge_bot', 'concierge_roadmap'];
  for (const customId of [...knownIds, 'concierge_unknown']) {
    let handled = 0;
    let legacyFallbacks = 0;
    await withButtonRouter({
      conciergeButtons: { matches: (id) => typeof id === 'string' && id.startsWith('concierge_'), handle: async () => { handled += 1; } },
      executeLegacy: async () => { legacyFallbacks += 1; }
    }, async ({ handleButtonInteraction }) => handleButtonInteraction({ customId }));
    assert.equal(handled, 1, `${customId} must use the modern Concierge family`);
    assert.equal(legacyFallbacks, 0, `${customId} must not reach legacy fallback`);
  }

  let conciergeHandled = 0;
  let legacyFallbacks = 0;
  await withButtonRouter({
    conciergeButtons: { matches: () => false, handle: async () => { conciergeHandled += 1; } },
    executeLegacy: async () => { legacyFallbacks += 1; return 'legacy'; }
  }, async ({ handleButtonInteraction }) => {
    assert.equal(await handleButtonInteraction({ customId: 'non_concierge_button' }), 'legacy');
  });
  assert.equal(conciergeHandled, 0);
  assert.equal(legacyFallbacks, 1);

  console.log('Modern Concierge button dispatch preserves routing, ignored returns, fallback, and error compatibility.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
