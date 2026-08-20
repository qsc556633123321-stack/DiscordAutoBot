const assert = require('node:assert/strict');
const { renderGameRoleProvisioningExecution } = require('../../../src/presentation/games/gameRoleProvisioningExecutionRenderer');

function findField(embed, name) {
  return embed.fields.find((field) => field.name === name);
}

const complete = renderGameRoleProvisioningExecution({
  status: 'complete',
  result: {
    ok: true,
    created: [{ roleName: '🎯 VALORANT', gameId: 'valorant' }],
    existing: [{ roleName: '🔫 APEX', gameId: 'apex' }],
    rolledBack: [],
    rollbackFailed: []
  }
}).embeds[0].toJSON();
assert.equal(complete.title, '✅ Game Role Provisioning Complete');
assert.match(complete.description, /Created: 1/);
assert.match(findField(complete, 'Created').value, /valorant/);

const blocked = renderGameRoleProvisioningExecution({
  status: 'blocked',
  preview: { conflicts: [{ gameId: 'apex', roleName: '🔫 APEX', code: 'LEGACY_LIKE_ROLE_NAME', legacyRoleName: 'APEX' }] }
}).embeds[0].toJSON();
assert.match(blocked.description, /blocked by current role conflicts/);
assert.match(findField(blocked, 'Conflicts').value, /legacy: APEX/);

const failure = renderGameRoleProvisioningExecution({
  status: 'failed',
  result: {
    code: 'CREATE_FAILED',
    failure: { gameId: 'minecraft', code: 'CREATE_REJECTED' },
    created: [], existing: [], conflicts: [],
    rolledBack: [{ roleName: '🔫 APEX', gameId: 'apex' }],
    rollbackFailed: [{ roleName: '🎯 VALORANT', gameId: 'valorant', code: 'ROLLBACK_DELETE_FAILED' }]
  }
}).embeds[0].toJSON();
assert.match(failure.description, /minecraft \| CREATE_REJECTED/);
assert.match(findField(failure, 'Rolled Back').value, /APEX/);
assert.match(findField(failure, 'Rollback Failed').value, /ROLLBACK_DELETE_FAILED/);

const nothing = renderGameRoleProvisioningExecution({ status: 'nothing', preview: { existing: [] } }).embeds[0].toJSON();
assert.match(nothing.description, /所有遊戲身分組已存在/);
console.log('Game role execution renderer tests passed.');
