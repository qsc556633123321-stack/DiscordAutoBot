const GAME_REGISTRY = require('../../domain/games/gameRegistry');
const { getGameRoleKey, getGameRoleName } = require('../../domain/games/gameAccessPolicy');

function assertGateway(gateway) {
  for (const method of ['preflightManageRoles', 'findRolesByExactName', 'createRole', 'deleteRole']) {
    if (typeof gateway?.[method] !== 'function') {
      throw new TypeError('GameRoleProvisioningUseCase requires gateway.' + method);
    }
  }
}

function buildGameRoleDescriptors(gameRegistry = GAME_REGISTRY) {
  return gameRegistry.map((game) => Object.freeze({
    gameId: game.id,
    roleKey: getGameRoleKey(game.id),
    roleName: getGameRoleName(game),
    legacyRoleName: game.displayName
  }));
}

function safeFailureCode(error, fallback) {
  return typeof error?.code === 'string' ? error.code : fallback;
}

function createGameRoleProvisioningUseCase({ gateway, gameRegistry = GAME_REGISTRY } = {}) {
  assertGateway(gateway);
  const descriptors = buildGameRoleDescriptors(gameRegistry);

  async function previewGameRoleProvisioning({ guildId } = {}) {
    const wouldCreate = [];
    const existing = [];
    const conflicts = [];

    for (const descriptor of descriptors) {
      const exactRoles = await gateway.findRolesByExactName({ guildId, name: descriptor.roleName });
      if (exactRoles.length > 1) {
        conflicts.push({ gameId: descriptor.gameId, roleKey: descriptor.roleKey, roleName: descriptor.roleName, code: 'DUPLICATE_EXACT_ROLE_NAME' });
        continue;
      }
      if (exactRoles.length === 1) {
        existing.push({ ...descriptor, roleId: exactRoles[0].roleId });
        continue;
      }

      const legacyRoles = await gateway.findRolesByExactName({ guildId, name: descriptor.legacyRoleName });
      if (legacyRoles.length > 0) {
        conflicts.push({ gameId: descriptor.gameId, roleKey: descriptor.roleKey, roleName: descriptor.roleName, legacyRoleName: descriptor.legacyRoleName, code: 'LEGACY_LIKE_ROLE_NAME' });
        continue;
      }
      wouldCreate.push(descriptor);
    }

    return Object.freeze({
      ok: conflicts.length === 0,
      created: Object.freeze([]),
      existing: Object.freeze(existing),
      wouldCreate: Object.freeze(wouldCreate),
      conflicts: Object.freeze(conflicts),
      rolledBack: Object.freeze([]),
      rollbackFailed: Object.freeze([])
    });
  }

  async function provisionGameRoles({ guildId } = {}) {
    const preflight = await gateway.preflightManageRoles({ guildId });
    if (!preflight?.canManageRoles) {
      return Object.freeze({ ok: false, code: preflight?.code || 'PERMISSION_DENIED', created: [], existing: [], conflicts: [], rolledBack: [], rollbackFailed: [] });
    }

    const preview = await previewGameRoleProvisioning({ guildId });
    if (!preview.ok) {
      return Object.freeze({ ok: false, code: 'CONFLICT', created: [], existing: preview.existing, conflicts: preview.conflicts, rolledBack: [], rollbackFailed: [] });
    }

    const created = [];
    for (const descriptor of preview.wouldCreate) {
      try {
        const role = await gateway.createRole({ guildId, roleName: descriptor.roleName });
        if (!role?.roleId) throw Object.assign(new Error('Role create returned no role id'), { code: 'CREATE_RESULT_INVALID' });
        created.push({ ...descriptor, roleId: role.roleId });
      } catch (error) {
        const rolledBack = [];
        const rollbackFailed = [];
        for (const createdRole of [...created].reverse()) {
          try {
            await gateway.deleteRole({ guildId, roleId: createdRole.roleId });
            rolledBack.push(createdRole);
          } catch (rollbackError) {
            rollbackFailed.push({ ...createdRole, code: safeFailureCode(rollbackError, 'ROLLBACK_DELETE_FAILED') });
          }
        }
        return Object.freeze({
          ok: false,
          code: 'CREATE_FAILED',
          failure: Object.freeze({ gameId: descriptor.gameId, code: safeFailureCode(error, 'CREATE_FAILED') }),
          created: Object.freeze(created),
          existing: preview.existing,
          conflicts: Object.freeze([]),
          rolledBack: Object.freeze(rolledBack),
          rollbackFailed: Object.freeze(rollbackFailed)
        });
      }
    }

    return Object.freeze({
      ok: true,
      created: Object.freeze(created),
      existing: preview.existing,
      conflicts: Object.freeze([]),
      rolledBack: Object.freeze([]),
      rollbackFailed: Object.freeze([])
    });
  }

  return Object.freeze({ previewGameRoleProvisioning, provisionGameRoles });
}

module.exports = { buildGameRoleDescriptors, createGameRoleProvisioningUseCase };
