const assert = require('node:assert/strict');
const { createFakeCommunityRoadmapMutationBoundary } = require('../../fakes/community/FakeCommunityRoadmapMutationBoundary');

(async () => {
  const saved = [];
  const boundary = createFakeCommunityRoadmapMutationBoundary({ saveOnboarding: (guildId, patch) => saved.push({ guildId, patch }) });
  const message = { id: 'M', async edit(payload) { assert.strictEqual(payload, input.payload); return { id: 'different' }; } };
  const input = { guildId: 'guild', channel: { id: 'channel', async send() { throw new Error('send must not run'); } }, message, payload: { embeds: [] } };
  const result = await boundary.publish(input);
  assert.strictEqual(result.message, message);
  assert.equal(saved[0].patch.roadmapMessageId, 'M');
  console.log('Roadmap mutation boundary test-only candidate preserves legacy identity shape');
})().catch((error) => { console.error(error); process.exitCode = 1; });
