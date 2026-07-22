const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/community-about');
const presentation = require('../../src/presentation/commands/communityAboutCommand');
const { buildAboutEmbed } = require('../../src/systems/communityConcierge');

async function main() {
  const sourcePayload = buildAboutEmbed({ name: 'Migration Guild' }).toJSON();
  const calls = [];
  const command = presentation.createCommunityAboutCommand({
    useCase: { execute: () => ({ ok: true, data: { about: { embed: sourcePayload } } }) }
  });
  await command.execute({ guild: { name: 'Migration Guild' }, reply: async (payload) => calls.push(payload) });

  assert.equal(legacy, presentation);
  assert.equal(legacy.data, presentation.data);
  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(command.data.toJSON(), legacy.data.toJSON());
  assert.deepEqual(calls[0].embeds[0].toJSON(), sourcePayload);
  assert.equal(calls[0].ephemeral, true);
  console.log('community-about migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
