const assert = require('node:assert/strict');
const { createCommunityAboutCommand } = require('../../../src/presentation/commands/communityAboutCommand');
const { createCommunityAboutModel } = require('../../../src/domain/community/communityAbout');

async function main() {
  const calls = [];
  const command = createCommunityAboutCommand();

  await command.execute({
    guild: { name: 'Vertical Slice Guild' },
    reply: async (payload) => calls.push(payload)
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].ephemeral, true);

  const renderedEmbed = calls[0].embeds[0].toJSON();
  const expectedEmbed = createCommunityAboutModel({ guildName: 'Vertical Slice Guild' }).embed;

  assert.match(renderedEmbed.timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  delete renderedEmbed.timestamp;
  assert.deepEqual(renderedEmbed, expectedEmbed);
  console.log('Community About vertical slice tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
