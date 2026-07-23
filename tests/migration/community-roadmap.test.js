const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/community-roadmap');
const presentation = require('../../src/presentation/commands/communityRoadmapCommand');
const { buildRoadmapEmbed } = require('../../src/systems/communityConcierge');

async function main() {
  const compatibilityPayload = buildRoadmapEmbed().toJSON();
  const command = presentation.createCommunityRoadmapCommand();
  const calls = [];

  await command.execute({ reply: async (payload) => calls.push(payload) });
  const activePayload = calls[0].embeds[0].toJSON();

  assert.equal(legacy, presentation);
  assert.equal(legacy.data, presentation.data);
  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(command.data.toJSON(), legacy.data.toJSON());
  assert.match(compatibilityPayload.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.match(activePayload.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  delete compatibilityPayload.timestamp;
  delete activePayload.timestamp;
  assert.deepEqual(activePayload, compatibilityPayload);
  assert.equal(calls[0].ephemeral, true);
  console.log('community-roadmap migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
