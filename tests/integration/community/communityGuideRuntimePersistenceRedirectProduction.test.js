const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withGenericExecute(execute, run) {
  const genericPath = require.resolve('../../../src/composition/communityPublicationStateFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(genericPath);
  require.cache[genericPath].exports = { createCommunityPublicationStateFeature() {
    return { persistCommunityPublicationRecord: { execute } };
  } };
  delete require.cache[runtimePath];
  try { await run(require(runtimePath)); } finally {
    delete require.cache[runtimePath];
    require.cache[genericPath].exports = original;
  }
}

async function verify({ trackedMessageId, mode, expectedId, useExistingMessage }) {
  let calls = 0;
  let input;
  await withGenericExecute((value) => {
    calls += 1;
    input = value;
    return { persisted: true, record: value.patch };
  }, async (concierge) => {
    await withOnboardingFile({ initial: { 'guild-1': trackedMessageId ? { guideMessageId: trackedMessageId } : {} } }, async ({ log }) => {
      const existingMessage = useExistingMessage ? createMessage(expectedId, log) : null;
      const guide = createTextChannel({
        id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
        behavior: existingMessage ? { existingMessage } : {}, label: 'guide'
      });
      const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
      const result = await concierge.setupCommunityGuide(guild, { mode });
      assert.strictEqual(result.message, existingMessage || result.message);
      assert.equal(result.message.id, expectedId);
      assert.equal(log.calls.filter((call) => call === 'guide.message.edit').length + log.calls.filter((call) => call === 'guide.message.send').length, 1);
    });
  });
  assert.equal(calls, 1);
  assert.deepEqual(Object.keys(input.patch), ['guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels']);
  assert.equal(input.guildId, 'guild-1');
  assert.equal(input.patch.guideChannelId, 'guide-channel');
  assert.equal(input.patch.guideMessageId, expectedId);
}

(async () => {
  await verify({ trackedMessageId: 'edit-message', mode: 'refresh', expectedId: 'edit-message', useExistingMessage: true });
  await verify({ mode: 'create', expectedId: 'guide-channel-sent' });
  console.log('Guide runtime persistence redirect preserves production Edit/Send identity and one atomic execute.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
