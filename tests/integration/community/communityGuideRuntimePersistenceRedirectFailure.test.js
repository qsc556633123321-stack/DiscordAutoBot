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

async function runGuide(concierge, mode, existingMessage, log) {
  const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: existingMessage ? { existingMessage } : {}, label: 'guide' });
  const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
  return concierge.setupCommunityGuide(guild, { mode });
}

(async () => {
  for (const mode of ['create', 'refresh']) {
    let count = 0;
    await withGenericExecute(() => { count += 1; return { persisted: false, record: {} }; }, async (concierge) => {
      await withOnboardingFile({ initial: { 'guild-1': mode === 'refresh' ? { guideMessageId: 'edit-message' } : {} } }, async ({ log }) => {
        const existing = mode === 'refresh' ? createMessage('edit-message', log) : null;
        const result = await runGuide(concierge, mode, existing, log);
        assert.strictEqual(result.message, existing || result.message);
        assert.equal(log.calls.filter((call) => call === 'guide.message.edit').length + log.calls.filter((call) => call === 'guide.message.send').length, 1);
      });
    });
    assert.equal(count, 1);
  }

  for (const thrown of [new Error('invariant'), 'invariant', 7, { failure: true }, null, undefined]) {
    let count = 0;
    await withGenericExecute(() => { count += 1; throw thrown; }, async (concierge) => {
      await withOnboardingFile({ initial: { 'guild-1': {} } }, async ({ log }) => {
        let caught = Symbol('not-thrown');
        try { await runGuide(concierge, 'create', null, log); } catch (error) { caught = error; }
        assert.strictEqual(caught, thrown);
        assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, 1);
      });
    });
    assert.equal(count, 1);
  }
  console.log('Guide runtime persistence redirect preserves writer partial success and raw invariant failure identity.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
