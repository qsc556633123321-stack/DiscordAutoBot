const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/help-me-start');
const presentation = require('../../src/presentation/commands/helpMeStartCommand');
const { createHelpMeStartFeature } = require('../../src/composition/community/helpMeStartFeature');
const { createFakeGuild, createFakeTextGenerator, toFacts } = require('../fixtures/helpMeStartFakes');
const baseline = require('../fixtures/helpMeStartLegacyBaseline');

function withoutUndefinedFooterIcon(payload) {
  if (payload.footer?.icon_url === undefined) delete payload.footer.icon_url;
  return payload;
}

async function main() {
  const guild = createFakeGuild();
  const generator = createFakeTextGenerator();
  const featureFactory = ({ guild: activeGuild }) => createHelpMeStartFeature({
    guildChannelReader: { listTextChannels: async () => toFacts() },
    conciergeTextGenerator: generator,
    guild: activeGuild
  });
  const calls = [];
  const command = presentation.createHelpMeStartCommand({
    featureFactory,
    clock: () => new Date('2025-01-02T03:04:05.678Z')
  });
  await command.execute({
    guild,
    options: { getString: (name) => ({ game: 'TFT', style: 'rank', online_time: 'late' }[name]) },
    deferReply: async (payload) => calls.push(['defer', payload]),
    editReply: async (payload) => calls.push(['edit', payload])
  });

  const payload = calls[1][1].embeds[0].toJSON();
  assert.equal(legacy, presentation);
  assert.equal(legacy.data, presentation.data);
  assert.equal(legacy.execute, presentation.execute);
  assert.deepEqual(JSON.parse(JSON.stringify(command.data.toJSON())), baseline.commandMetadata);
  assert.deepEqual(calls[0], ['defer', baseline.deferredReply]);
  assert.deepEqual(generator.calls, [{ kind: 'help_me_start', context: baseline.aiContext, fallback: baseline.fallback }]);
  assert.equal(payload.timestamp, '2025-01-02T03:04:05.678Z');
  delete payload.timestamp;
  assert.deepEqual(withoutUndefinedFooterIcon(payload), baseline.embedWithoutTimestamp);
  assert.deepEqual(Object.keys(calls[1][1]), ['embeds']);

  const invalidCommand = presentation.createHelpMeStartCommand({ featureFactory });
  await assert.rejects(() => invalidCommand.execute({
    guild,
    options: { getString: (name) => ({ game: '[', style: 'chat', online_time: 'mixed' }[name]) },
    deferReply: async () => null,
    editReply: async () => null
  }), SyntaxError);
  console.log('help-me-start migration regression tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
