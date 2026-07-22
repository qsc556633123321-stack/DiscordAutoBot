const assert = require('node:assert/strict');
const legacy = require('../../src/legacy/commands/dev-audit-commands');
const presentation = require('../../src/presentation/commands/devAuditCommandsCommand');

function createInteraction() {
  const calls = [];
  return {
    calls,
    deferReply: async (payload) => calls.push(['deferReply', payload]),
    editReply: async (payload) => calls.push(['editReply', payload])
  };
}

function normalize(calls) {
  return calls.map(([method, payload]) => [method, payload?.embeds
    ? { ...payload, embeds: payload.embeds.map((embed) => embed.toJSON()) }
    : payload]);
}

async function main() {
  const report = {
    deployMode: 'registry',
    implemented: ['community', 'game'],
    documentedOnly: ['missing-doc-command'],
    invalid: [{ file: 'broken.js', reason: 'missing execute' }],
    undocumented: ['legacy-command']
  };
  const command = presentation.createDevAuditCommandsCommand({ useCase: { execute: () => report } });
  const interaction = createInteraction();
  await command.execute(interaction);

  const calls = normalize(interaction.calls);
  assert.deepEqual(calls[0], ['deferReply', { ephemeral: true }]);
  assert.equal(calls[1][0], 'editReply');
  assert.equal(calls[1][1].embeds[0].title, 'Command Implementation Audit');
  assert.equal(calls[1][1].embeds[0].description, 'Deploy loader: registry\nImplemented: 2');
  assert.equal(calls[1][1].embeds[0].fields.length, 4);
  assert.equal(legacy.execute, presentation.execute);
  assert.equal(legacy, presentation);
  assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
  console.log('dev-audit-commands migration regression tests passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
