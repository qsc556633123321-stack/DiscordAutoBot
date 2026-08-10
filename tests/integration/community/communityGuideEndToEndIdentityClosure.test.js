const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withGenericExecute(execute, run) {
  const genericPath = require.resolve('../../../src/composition/communityPublicationStateFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(genericPath);
  require.cache[genericPath].exports = {
    createCommunityPublicationStateFeature() {
      return { persistCommunityPublicationRecord: { execute } };
    }
  };
  delete require.cache[runtimePath];
  try {
    await run(require(runtimePath));
  } finally {
    delete require.cache[runtimePath];
    require.cache[genericPath].exports = original;
  }
}

async function verify({ mode, trackedMessageId, expectedMessageId }) {
  let executeCount = 0;
  let persistedRequest;
  await withGenericExecute((request) => {
    executeCount += 1;
    persistedRequest = request;
    return { persisted: true, record: request.patch };
  }, async (concierge) => {
    await withOnboardingFile({ initial: { 'guild-1': trackedMessageId ? { guideMessageId: trackedMessageId } : {} } }, async ({ log }) => {
      const existing = trackedMessageId ? createMessage(expectedMessageId, log) : null;
      const guide = createTextChannel({
        id: 'guide-channel', name: concierge.GUIDE_CHANNEL_NAME, parentId: 'category-existing', log,
        behavior: existing ? { existingMessage: existing } : {}, label: 'guide'
      });
      const guild = createGuild({
        guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
        log, behavior: { categoryExists: true }, existingGuide: guide
      });
      const result = await concierge.setupCommunityGuide(guild, { mode });
      const expectedMessage = existing || result.message;
      assert.strictEqual(result.message, expectedMessage);
      assert.equal(result.message.id, expectedMessageId);
      assert.equal(log.calls.filter((call) => call === 'guide.message.fetch').length, trackedMessageId ? 1 : 0);
      assert.equal(log.calls.filter((call) => call === 'guide.message.edit').length, trackedMessageId ? 1 : 0);
      assert.equal(log.calls.filter((call) => call === 'guide.message.send').length, trackedMessageId ? 0 : 1);
    });
  });
  assert.equal(executeCount, 1);
  assert.equal(persistedRequest.patch.guideMessageId, expectedMessageId);
}

(async () => {
  await verify({ mode: 'refresh', trackedMessageId: 'edit-message', expectedMessageId: 'edit-message' });
  await verify({ mode: 'create', expectedMessageId: 'guide-channel-sent' });
  console.log('Guide edit and send identity remain exact through lookup, mutation, persistence, and return.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
