const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createServerGovernancePreviewCommand } = require('../../../src/presentation/commands/serverGovernancePreviewCommand');
void (async () => {
  const calls = [];
  const command = createServerGovernancePreviewCommand({ createFeature: () => ({ serverGovernancePreview: { async previewFullGuildGovernance() { return {}; } } }), renderPreview: () => [{ content: 'first' }, { content: 'second' }] });
  const interaction = { guild: { id: 'g1' }, memberPermissions: { has: (permission) => permission === PermissionFlagsBits.Administrator }, deferReply: async (payload) => calls.push(['defer', payload]), editReply: async (payload) => calls.push(['edit', payload]), followUp: async (payload) => calls.push(['followup', payload]) };
  await command.execute(interaction);
  assert.equal(calls[0][0], 'defer'); assert.equal(calls[1][0], 'edit'); assert.equal(calls[2][0], 'followup');
  const denied = []; await command.execute({ guild: { id: 'g1' }, memberPermissions: { has: () => false }, deferReply: async () => {}, editReply: async (payload) => denied.push(payload) });
  assert.equal(denied[0].includes('Administrator'), true);
  console.log('Server governance preview command tests passed.');
})();
