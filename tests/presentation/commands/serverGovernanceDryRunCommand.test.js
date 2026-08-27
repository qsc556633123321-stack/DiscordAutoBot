const assert = require('node:assert/strict');
const { createServerGovernanceDryRunCommand } = require('../../../src/presentation/commands/serverGovernanceDryRunCommand');
const calls = [];
const interaction = { guild: { id: 'g1' }, memberPermissions: { has: () => true }, deferReply: async () => calls.push('defer'), editReply: async (value) => calls.push(value) };
const command = createServerGovernanceDryRunCommand({
  createPreviewFeature: () => ({ serverGovernancePreview: { previewFullGuildGovernance: async () => ({ plan: { actions: [] } }) } }),
  createExecutionFeature: () => ({ readGuildInventory: async () => [], serverGovernanceExecution: { execute: async (input) => { assert.equal(input.mode, 'dry_run'); return { mode: 'dry_run', preflight: { ok: true, reasons: [] }, summary: {} }; } } }),
  renderDryRun: (result) => ({ content: result.mode })
});
void (async () => { await command.execute(interaction); assert.deepEqual(calls, ['defer', { content: 'dry_run' }]); console.log('Server governance dry-run command tests passed.'); })();
