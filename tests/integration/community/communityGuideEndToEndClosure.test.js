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

async function verify({ mode, trackedMessageId, messageId }) {
  let executeCount = 0;
  let input;
  await withGenericExecute((value) => {
    executeCount += 1;
    input = value;
    return { persisted: true, record: value.patch };
  }, async (concierge) => {
    await withOnboardingFile({ initial: { 'guild-1': trackedMessageId ? { guideMessageId: trackedMessageId } : {} } }, async ({ log }) => {
      const existingMessage = trackedMessageId ? createMessage(messageId, log) : null;
      const guide = createTextChannel({ id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log, behavior: existingMessage ? { existingMessage } : {}, label: 'guide' });
      const guild = createGuild({ guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME, log, behavior: { categoryExists: true }, existingGuide: guide });
      const result = await concierge.setupCommunityGuide(guild, { mode });
      assert.strictEqual(result.channel, guide);
      assert.strictEqual(result.message, existingMessage || result.message);
      assert.equal(result.message.id, messageId);
      assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, trackedMessageId ? 1 : 0);
      assert.equal(log.calls.filter((call) => call === 'guide.message.edit').length, trackedMessageId ? 1 : 0);
      assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, trackedMessageId ? 0 : 1);
      assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, trackedMessageId ? 1 : 0, 'no post-mutation fetch');
    });
  });
  assert.equal(executeCount, 1);
  assert.deepEqual(Object.keys(input.patch), ['guideChannelId', 'guideMessageId', 'nativeTaskRecommendations', 'nativeTaskExcludedChannels']);
  assert.equal(input.patch.guideChannelId, 'guide-channel');
  assert.equal(input.patch.guideMessageId, messageId);
}

(async () => {
  await verify({ mode: 'refresh', trackedMessageId: 'existing-message', messageId: 'existing-message' });
  await verify({ mode: 'create', messageId: 'guide-channel-sent' });
  console.log('Guide end-to-end closure preserves lookup, mutation, persistence, identity, and no-extra-I/O contracts.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
