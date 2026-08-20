const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { CONFIRMATION, createGameRoleProvisioningExecutionCommand } = require('../../../src/presentation/commands/gameRoleProvisioningExecutionCommand');

function createInteraction({ administrator = true, confirm = CONFIRMATION } = {}) {
  const calls = [];
  return {
    guild: { id: 'guild-1' },
    memberPermissions: { has: (permission) => administrator && permission === PermissionFlagsBits.Administrator },
    options: { getString: () => confirm },
    deferReply: async (payload) => calls.push(['defer', payload]),
    editReply: async (payload) => calls.push(['edit', payload]),
    calls
  };
}

function featureFor({ preview, result } = {}) {
  const calls = { preview: 0, provision: 0 };
  return {
    calls,
    feature: { gameRoleProvisioning: {
      previewGameRoleProvisioning: async () => { calls.preview += 1; return preview; },
      provisionGameRoles: async () => { calls.provision += 1; return result; }
    } }
  };
}

void (async () => {
  const states = featureFor({ preview: { conflicts: [], wouldCreate: [{ roleName: '🎯 VALORANT' }], existing: [] }, result: { ok: true, created: [], existing: [], rolledBack: [], rollbackFailed: [] } });
  const command = createGameRoleProvisioningExecutionCommand({
    createFeature: () => states.feature,
    renderExecution: ({ status }) => ({ content: status })
  });
  const unauthorized = createInteraction({ administrator: false });
  await command.execute(unauthorized);
  assert.equal(states.calls.preview, 0);
  assert.equal(states.calls.provision, 0);

  const wrongConfirmation = createInteraction({ confirm: 'CREATE' });
  await command.execute(wrongConfirmation);
  assert.equal(states.calls.preview, 0);
  assert.equal(states.calls.provision, 0);

  const conflictState = featureFor({ preview: { conflicts: [{ code: 'DUPLICATE_EXACT_ROLE_NAME' }], wouldCreate: [{ roleName: 'x' }], existing: [] } });
  await createGameRoleProvisioningExecutionCommand({ createFeature: () => conflictState.feature, renderExecution: ({ status }) => ({ content: status }) }).execute(createInteraction());
  assert.equal(conflictState.calls.preview, 1);
  assert.equal(conflictState.calls.provision, 0);

  const nothingState = featureFor({ preview: { conflicts: [], wouldCreate: [], existing: [{ roleName: 'x' }] } });
  await createGameRoleProvisioningExecutionCommand({ createFeature: () => nothingState.feature, renderExecution: ({ status }) => ({ content: status }) }).execute(createInteraction());
  assert.equal(nothingState.calls.preview, 1);
  assert.equal(nothingState.calls.provision, 0);

  const successful = createInteraction();
  await command.execute(successful);
  assert.equal(states.calls.preview, 1);
  assert.equal(states.calls.provision, 1);
  assert.deepEqual(successful.calls, [['defer', { ephemeral: true }], ['edit', { content: 'complete' }]]);
  console.log('Game role execution command tests passed.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
