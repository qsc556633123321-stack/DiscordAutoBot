const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withGenericExecute(execute, run) {
  const genericPath = require.resolve('../../../src/composition/communityPublicationStateFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(genericPath);
  require.cache[genericPath].exports = { createCommunityPublicationStateFeature() { return { persistCommunityPublicationRecord: { execute } }; } };
  delete require.cache[runtimePath];
  try { await run(require(runtimePath)); } finally { delete require.cache[runtimePath]; require.cache[genericPath].exports = original; }
}

function createGuideRuntime(concierge, log, behavior = {}, existingMessage) {
  const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: { ...behavior, ...(existingMessage ? { existingMessage } : {}) }, label: 'guide' });
  return { guide, guild: createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide }) };
}

(async () => {
  await withGenericExecute(() => ({ persisted: true }), async (concierge) => {
    await withOnboardingFile({ initial: { 'guild-1': { guideMessageId: 'missing' } } }, async ({ log }) => {
      const { guild } = createGuideRuntime(concierge, log, { fetchFails: true });
      const result = await concierge.setupCommunityGuide(guild, { mode: 'refresh' });
      assert.equal(result.message.id, 'guide-channel-sent');
      assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, 1);
      assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 1);
    });
  });

  for (const operation of ['edit', 'send']) {
    const sentinel = operation === 'edit' ? new Error('exact edit failure') : { failure: 'exact send failure' };
    await withGenericExecute(() => ({ persisted: true }), async (concierge) => {
      await withOnboardingFile({ initial: { 'guild-1': operation === 'edit' ? { guideMessageId: 'existing' } : {} } }, async ({ log }) => {
        const existing = operation === 'edit' ? createMessage('existing', log) : null;
        if (existing) existing.edit = async () => { log.calls.push('guide.message.edit'); throw sentinel; };
        const { guide, guild } = createGuideRuntime(concierge, log, operation === 'send' ? {} : {}, existing);
        if (operation === 'send') guide.send = async () => { log.calls.push('guide.message.send'); throw sentinel; };
        let caught = Symbol('not-thrown');
        try { await concierge.setupCommunityGuide(guild, { mode: operation === 'edit' ? 'refresh' : 'create' }); } catch (error) { caught = error; }
        assert.strictEqual(caught, sentinel);
        assert.equal(log.calls.filter((call) => call === `guide.message.${operation}`).length, 1);
      });
    });
  }

  for (const thrown of [new Error('persistence invariant'), 'primitive persistence invariant', undefined]) {
    await withGenericExecute(() => { throw thrown; }, async (concierge) => {
      await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
        const { guild } = createGuideRuntime(concierge, log);
        let caught = Symbol('not-thrown');
        try { await concierge.setupCommunityGuide(guild, { mode: 'create' }); } catch (error) { caught = error; }
        assert.strictEqual(caught, thrown);
        assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 1);
      });
    });
  }
  console.log('Guide end-to-end failure closure preserves lookup fallback, mutation identity, and persistence invariant behavior.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
