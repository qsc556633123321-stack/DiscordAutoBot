const assert = require('node:assert/strict');
const { BLOCK_WHEN_GOVERNANCE_ENABLED } = require('../../../src/application/community/serverGovernanceLegacyMutationPolicy');
const {
  createGovernanceGuardedLegacyCommand,
  guardLegacyMutationInteraction
} = require('../../../src/modules/commands/serverGovernanceLegacyMutationGuard');
const { handleButtonInteraction } = require('../../../src/modules/interactions/buttonInteractionHandler');

function createInteraction() {
  const replies = [];
  return { replies, async reply(payload) { replies.push(payload); }, async editReply(payload) { replies.push(payload); } };
}

void (async () => {
  for (const operation of BLOCK_WHEN_GOVERNANCE_ENABLED) {
    let calls = 0;
    const command = createGovernanceGuardedLegacyCommand({ data: { name: operation }, execute: async () => { calls += 1; } }, { environment: {} });
    await command.execute(createInteraction());
    assert.equal(calls, 1, `${operation} remains reachable when governance is disabled`);
    calls = 0;
    const guarded = createGovernanceGuardedLegacyCommand({ data: { name: operation }, execute: async () => { calls += 1; } }, { environment: { SERVER_GOVERNANCE_ENABLED: 'true' } });
    const interaction = createInteraction();
    await guarded.execute(interaction);
    assert.equal(calls, 0, `${operation} does not invoke legacy implementation when governance is enabled`);
    assert.equal(interaction.replies.length, 1);
    assert.match(interaction.replies[0].content, /Server Governance 已接管/);
  }

  const confirmation = createInteraction();
  assert.equal(await guardLegacyMutationInteraction(confirmation, 'apply-role-permissions', { environment: { SERVER_GOVERNANCE_ENABLED: 'true' } }), true);
  assert.equal(confirmation.replies.length, 1);
  const ticket = createInteraction();
  assert.equal(await guardLegacyMutationInteraction(ticket, null, { environment: { SERVER_GOVERNANCE_ENABLED: 'true' } }), false);
  assert.equal(ticket.replies.length, 0);
  const previous = process.env.SERVER_GOVERNANCE_ENABLED;
  process.env.SERVER_GOVERNANCE_ENABLED = 'true';
  const staleConfirmation = { ...createInteraction(), customId: 'roleperm_confirm_stale-plan' };
  await handleButtonInteraction(staleConfirmation);
  assert.equal(staleConfirmation.replies.length, 1, 'stored confirmation buttons are blocked before legacy execution');
  if (previous === undefined) delete process.env.SERVER_GOVERNANCE_ENABLED;
  else process.env.SERVER_GOVERNANCE_ENABLED = previous;
  console.log('Server governance legacy mutation guard integration tests passed.');
})();
