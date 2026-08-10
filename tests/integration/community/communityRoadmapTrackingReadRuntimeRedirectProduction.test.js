const assert = require('node:assert/strict');
const { createGuild, createMessage, createTextChannel, withOnboardingFile } = require('../../helpers/createCommunityGuideMutationHarness');

async function withPersistenceStub(run) {
  const genericPath = require.resolve('../../../src/composition/communityPublicationStateFeature');
  const runtimePath = require.resolve('../../../src/systems/communityConcierge');
  const original = require(genericPath);
  const persisted = [];
  require.cache[genericPath].exports = {
    createCommunityPublicationStateFeature() {
      return { persistCommunityPublicationRecord: { execute(request) { persisted.push(request); return { record: request.patch }; } } };
    }
  };
  delete require.cache[runtimePath];
  try { await run(require(runtimePath), persisted); } finally {
    delete require.cache[runtimePath];
    require.cache[genericPath].exports = original;
  }
}

async function verify({ raw, existing = false, readFails = false }) {
  await withPersistenceStub(async (concierge, persisted) => {
    const initial = raw === undefined ? { 'guild-1': {} } : { 'guild-1': { roadmapMessageId: raw } };
    await withOnboardingFile({ initial, readFails }, async ({ log }) => {
      const existingMessage = existing ? createMessage(raw, log, {}, 'roadmap') : null;
      const roadmap = createTextChannel({
        id: 'roadmap-channel', name: concierge.ROADMAP_CHANNEL_NAME, parentId: 'category-existing', log,
        behavior: existingMessage ? { existingMessage } : {}, label: 'roadmap'
      });
      const fetchArguments = [];
      roadmap.messages.fetch = async (messageId) => {
        log.calls.push('roadmap.message.fetch');
        fetchArguments.push(messageId);
        return existingMessage;
      };
      const guild = createGuild({
        guideName: concierge.GUIDE_CHANNEL_NAME, roadmapName: concierge.ROADMAP_CHANNEL_NAME,
        log, behavior: { categoryExists: true }, existingRoadmap: roadmap
      });
      const result = await concierge.setupRoadmapPanel(guild);
      const expectedLookup = Boolean(raw) && !readFails;
      assert.equal(log.calls.filter((call) => call === 'onboarding.read').length, 1);
      assert.equal(fetchArguments.length, expectedLookup ? 1 : 0);
      if (expectedLookup && raw && typeof raw === 'object') assert.deepEqual(fetchArguments[0], raw);
      else if (expectedLookup) assert.strictEqual(fetchArguments[0], raw);
      assert.equal(log.calls.filter((call) => call === 'roadmap.message.edit').length + log.calls.filter((call) => call === 'roadmap.message.send').length, 1);
      assert.equal(persisted.length, 1);
      assert.equal(persisted[0].guildId, 'guild-1');
      assert.equal(persisted[0].patch.roadmapMessageId, result.message.id);
      assert.strictEqual(result.channel, roadmap);
    });
  });
}

(async () => {
  await verify({ raw: 'roadmap-existing', existing: true });
  await verify({ raw: undefined });
  for (const raw of [null, '', false, 0]) await verify({ raw });
  for (const raw of [123, true, {}, [], '   ']) await verify({ raw });
  await verify({ raw: 'ignored-after-reader-failure', readFails: true });
  console.log('Roadmap production tracking-read redirect preserves lookup, malformed raw IDs, persistence, return identity, and one read.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
