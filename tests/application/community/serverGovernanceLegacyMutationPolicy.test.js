const assert = require('node:assert/strict');
const {
  BLOCK_WHEN_GOVERNANCE_ENABLED,
  assertLegacyGuildMutationAllowed,
  getServerGovernanceConfiguration,
  getLegacyMutationOperationFromCustomId,
  isServerGovernanceEnabled
} = require('../../../src/application/community/serverGovernanceLegacyMutationPolicy');

const required = [
  'auto-organize', 'deep-cleanup', 'rebuild-server',
  'cleanup-empty-categories', 'factory-reset-server', 'ai-reorganize-server',
  'restore-active-channels', 'apply-role-permissions'
];
for (const operation of required) assert.equal(BLOCK_WHEN_GOVERNANCE_ENABLED.has(operation), true);
assert.equal(isServerGovernanceEnabled({}), false);
assert.equal(isServerGovernanceEnabled({ SERVER_GOVERNANCE_ENABLED: 'true' }), true);
assert.equal(isServerGovernanceEnabled({ SERVER_GOVERNANCE_ENABLED: 'TRUE' }), false);
assert.deepEqual(getServerGovernanceConfiguration({ SERVER_GOVERNANCE_ENABLED: 'true' }), { governanceEnabled: true, executionEnabled: false });
assert.deepEqual(getServerGovernanceConfiguration({ SERVER_GOVERNANCE_ENABLED: 'true', SERVER_GOVERNANCE_EXECUTION_ENABLED: 'true' }), { governanceEnabled: true, executionEnabled: true });
for (const operation of BLOCK_WHEN_GOVERNANCE_ENABLED) {
  assert.equal(assertLegacyGuildMutationAllowed(operation, { environment: {} }).allowed, true);
  assert.equal(assertLegacyGuildMutationAllowed(operation, { environment: { SERVER_GOVERNANCE_ENABLED: 'true' } }).allowed, false);
}
assert.equal(assertLegacyGuildMutationAllowed('tempvoice-panel', { environment: { SERVER_GOVERNANCE_ENABLED: 'true' } }).allowed, true);
assert.equal(getLegacyMutationOperationFromCustomId('confirm_auto_organize_plan'), 'auto-organize');
assert.equal(getLegacyMutationOperationFromCustomId('roleperm_confirm_plan'), 'apply-role-permissions');
assert.equal(getLegacyMutationOperationFromCustomId('ticket:confirm-close'), null);
console.log('Server governance legacy mutation policy tests passed.');
