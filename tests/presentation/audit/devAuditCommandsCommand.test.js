const assert = require('node:assert/strict');
const { createDevAuditCommandsCommand } = require('../../../src/presentation/commands/devAuditCommandsCommand');

const calls = [];
const interaction = { deferReply: async (payload) => calls.push(['deferReply', payload]), editReply: async (payload) => calls.push(['editReply', payload]) };
const command = createDevAuditCommandsCommand({ useCase: { execute: () => ({ deployMode: 'registry', implemented: ['community', 'game'], documentedOnly: ['missing'], invalid: [{ file: 'broken.js', reason: 'missing execute' }], undocumented: ['legacy'] }) } });

(async () => {
  await command.execute(interaction);
  assert.deepEqual(calls[0], ['deferReply', { ephemeral: true }]);
  const embed = calls[1][1].embeds[0].toJSON();
  assert.equal(embed.title, 'Command Implementation Audit');
  assert.equal(embed.description, 'Deploy loader: registry\nImplemented: 2');
  assert.equal(embed.fields.length, 4);
  console.log('Audit presentation tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
