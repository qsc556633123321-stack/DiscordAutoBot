const assert = require('node:assert/strict');
const { buildGameRoleDescriptors, createGameRoleProvisioningUseCase } = require('../../../src/application/games/gameRoleProvisioningUseCase');

const games = [
  { id: 'valorant', displayName: 'VALORANT', emoji: '🎯' },
  { id: 'apex', displayName: 'APEX', emoji: '🔫' },
  { id: 'minecraft', displayName: 'Minecraft', emoji: '⛏️' }
];

function createGateway({ existingNames = [], duplicateNames = [], legacyNames = [], canManageRoles = true, failCreateName = null, failDeleteId = null } = {}) {
  const calls = { find: [], create: [], delete: [] };
  let id = 0;
  return {
    calls,
    async preflightManageRoles() { return { canManageRoles, code: canManageRoles ? null : 'PERMISSION_DENIED' }; },
    async findRolesByExactName({ name }) {
      calls.find.push(name);
      if (duplicateNames.includes(name)) return [{ roleId: 'duplicate-1', roleName: name }, { roleId: 'duplicate-2', roleName: name }];
      if (existingNames.includes(name) || legacyNames.includes(name)) return [{ roleId: 'existing-' + name, roleName: name }];
      return [];
    },
    async createRole({ roleName }) {
      calls.create.push(roleName);
      if (roleName === failCreateName) throw Object.assign(new Error('create failed'), { code: 'CREATE_REJECTED' });
      id += 1;
      return { roleId: 'created-' + id, roleName };
    },
    async deleteRole({ roleId }) {
      calls.delete.push(roleId);
      if (roleId === failDeleteId) throw Object.assign(new Error('delete failed'), { code: 'DELETE_REJECTED' });
      return { roleId };
    }
  };
}

assert.equal(buildGameRoleDescriptors().length, 10);
assert.equal(new Set(buildGameRoleDescriptors().map((item) => item.roleKey)).size, 10);
assert.equal(new Set(buildGameRoleDescriptors().map((item) => item.roleName)).size, 10);

void (async () => {
  const allMissingGateway = createGateway();
  const allMissing = createGameRoleProvisioningUseCase({ gateway: allMissingGateway, gameRegistry: games });
  const preview = await allMissing.previewGameRoleProvisioning({ guildId: 'g1' });
  assert.equal(preview.ok, true);
  assert.equal(preview.wouldCreate.length, 3);
  assert.equal(allMissingGateway.calls.create.length, 0);
  assert.equal(allMissingGateway.calls.delete.length, 0);
  const created = await allMissing.provisionGameRoles({ guildId: 'g1' });
  assert.equal(created.ok, true);
  assert.deepEqual(allMissingGateway.calls.create, ['🎯 VALORANT', '🔫 APEX', '⛏️ Minecraft']);

  const existingGateway = createGateway({ existingNames: ['🎯 VALORANT', '🔫 APEX', '⛏️ Minecraft'] });
  const allExisting = await createGameRoleProvisioningUseCase({ gateway: existingGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(allExisting.ok, true);
  assert.equal(allExisting.existing.length, 3);
  assert.equal(existingGateway.calls.create.length, 0);

  const mixedGateway = createGateway({ existingNames: ['🎯 VALORANT'] });
  const mixed = await createGameRoleProvisioningUseCase({ gateway: mixedGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(mixed.ok, true);
  assert.equal(mixed.existing.length, 1);
  assert.deepEqual(mixedGateway.calls.create, ['🔫 APEX', '⛏️ Minecraft']);

  const duplicateGateway = createGateway({ duplicateNames: ['🎯 VALORANT'] });
  const duplicate = await createGameRoleProvisioningUseCase({ gateway: duplicateGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, 'CONFLICT');
  assert.equal(duplicate.conflicts[0].code, 'DUPLICATE_EXACT_ROLE_NAME');
  assert.equal(duplicateGateway.calls.create.length, 0);

  const legacyGateway = createGateway({ legacyNames: ['APEX'] });
  const legacy = await createGameRoleProvisioningUseCase({ gateway: legacyGateway, gameRegistry: games }).previewGameRoleProvisioning({ guildId: 'g1' });
  assert.equal(legacy.ok, false);
  assert.equal(legacy.conflicts[0].code, 'LEGACY_LIKE_ROLE_NAME');

  const deniedGateway = createGateway({ canManageRoles: false });
  const denied = await createGameRoleProvisioningUseCase({ gateway: deniedGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(denied.ok, false);
  assert.equal(denied.code, 'PERMISSION_DENIED');
  assert.equal(deniedGateway.calls.create.length, 0);

  const rollbackGateway = createGateway({ failCreateName: '⛏️ Minecraft' });
  const rollback = await createGameRoleProvisioningUseCase({ gateway: rollbackGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(rollback.ok, false);
  assert.equal(rollback.failure.code, 'CREATE_REJECTED');
  assert.deepEqual(rollbackGateway.calls.delete, ['created-2', 'created-1']);
  assert.equal(rollback.rolledBack.length, 2);

  const rollbackFailureGateway = createGateway({ failCreateName: '⛏️ Minecraft', failDeleteId: 'created-1' });
  const rollbackFailure = await createGameRoleProvisioningUseCase({ gateway: rollbackFailureGateway, gameRegistry: games }).provisionGameRoles({ guildId: 'g1' });
  assert.equal(rollbackFailure.ok, false);
  assert.equal(rollbackFailure.failure.code, 'CREATE_REJECTED');
  assert.equal(rollbackFailure.rolledBack.length, 1);
  assert.equal(rollbackFailure.rollbackFailed[0].roleId, 'created-1');

  console.log('Game role provisioning application tests passed.');
})();
