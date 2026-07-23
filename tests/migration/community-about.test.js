const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/community-about');
const presentation = require('../../src/presentation/commands/communityAboutCommand');
const { buildAboutEmbed } = require('../../src/systems/communityConcierge');

async function main() {
  const sourcePayload = buildAboutEmbed({ name: 'Migration Guild' }).toJSON();
  const calls = [];
  const command = presentation.createCommunityAboutCommand();
  await command.execute({ guild: { name: 'Migration Guild' }, reply: async (payload) => calls.push(payload) });

  assert.equal(legacy, presentation);
  assert.equal(legacy.data, presentation.data);
  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(command.data.toJSON(), legacy.data.toJSON());
  const renderedPayload = calls[0].embeds[0].toJSON();
  assert.match(sourcePayload.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.match(renderedPayload.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  delete sourcePayload.timestamp;
  delete renderedPayload.timestamp;
  assert.deepEqual(renderedPayload, sourcePayload);
  assert.equal(calls[0].ephemeral, true);
  console.log('community-about migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
