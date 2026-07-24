const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/help-me-start');
const presentation = require('../../src/presentation/commands/helpMeStartCommand');
const { buildHelpMeStartEmbed } = require('../../src/systems/interactiveGuideSystem');
const { createFakeGuild } = require('../fixtures/helpMeStartFakes');

async function main() {
  const guild = createFakeGuild();
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = '';
  try {
    const sourcePayload = (await buildHelpMeStartEmbed(guild, { game: 'TFT', style: 'rank', onlineTime: 'late' })).toJSON();
    const calls = [];
    const command = presentation.createHelpMeStartCommand();
    await command.execute({
      guild,
      options: { getString: (name) => ({ game: 'TFT', style: 'rank', online_time: 'late' }[name]) },
      deferReply: async (payload) => calls.push(['defer', payload]),
      editReply: async (payload) => calls.push(['edit', payload])
    });
    const renderedPayload = calls[1][1].embeds[0].toJSON();
    assert.equal(legacy, presentation);
    assert.equal(legacy.data, presentation.data);
    assert.equal(legacy.execute, presentation.execute);
    assert.deepEqual(command.data.toJSON(), legacy.data.toJSON());
    assert.match(sourcePayload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.match(renderedPayload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    delete sourcePayload.timestamp;
    delete renderedPayload.timestamp;
    assert.deepEqual(renderedPayload, sourcePayload);
    assert.deepEqual(calls[0], ['defer', { ephemeral: true }]);
    console.log('help-me-start migration regression tests passed.');
  } finally {
    if (previous === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previous;
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
