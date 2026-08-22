const GAME_REGISTRY = require('../../domain/games/gameRegistry');
const { GAME_PARENT_ROLE_KEY, getGameIdFromRoleKey } = require('../../domain/games/gameAccessPolicy');
const { deriveGameRoleSelectionPlan } = require('../../domain/games/gameRoleSelectionPolicy');

function assertGateway(gateway) {
  for (const method of ['getMemberRoleState', 'resolveSpecificGameRoles', 'addMemberRole', 'removeMemberRole']) {
    if (typeof gateway?.[method] !== 'function') throw new TypeError('GameRoleSelectionUseCase requires gateway.' + method);
  }
}

function createGameRoleSelectionUseCase({ gateway, gameRegistry = GAME_REGISTRY } = {}) {
  assertGateway(gateway);
  async function getSelectionState({ guildId, memberId } = {}) {
    const state = await gateway.getMemberRoleState({ guildId, memberId });
    return Object.freeze({
      hasParentGameRole: Boolean(state?.hasParentGameRole),
      selectedGameIds: Object.freeze((state?.currentSpecificGameRoleKeys || []).map(getGameIdFromRoleKey).filter(Boolean))
    });
  }

  async function execute({ guildId, memberId, selectedGameIds = [] } = {}) {
    const rawState = await gateway.getMemberRoleState({ guildId, memberId });
    if (!rawState?.hasParentGameRole) return Object.freeze({ ok: false, code: 'PARENT_GAME_ROLE_REQUIRED', parentRoleKey: GAME_PARENT_ROLE_KEY });
    const plan = deriveGameRoleSelectionPlan({ currentRoleKeys: rawState.currentSpecificGameRoleKeys, selectedGameIds, gameRegistry });
    if (!plan.ok) return plan;
    const targetGameIds = [...new Set([...plan.addRoleKeys, ...plan.removeRoleKeys].map(getGameIdFromRoleKey).filter(Boolean))];
    const resolved = await gateway.resolveSpecificGameRoles({ guildId, gameIds: targetGameIds });
    if (resolved.missingGameIds?.length) return Object.freeze({ ok: false, code: 'ROLE_NOT_PROVISIONED', missingGameIds: Object.freeze(resolved.missingGameIds) });
    if (resolved.unmanageableGameIds?.length) return Object.freeze({ ok: false, code: 'ROLE_NOT_MANAGEABLE', unmanageableGameIds: Object.freeze(resolved.unmanageableGameIds) });

    const addedRoleKeys = [];
    const removedRoleKeys = [];
    for (const roleKey of plan.addRoleKeys) {
      try { await gateway.addMemberRole({ guildId, memberId, roleId: resolved.rolesByGameId[getGameIdFromRoleKey(roleKey)].roleId }); addedRoleKeys.push(roleKey); }
      catch (error) { return Object.freeze({ ok: false, code: 'ADD_FAILED', failedRoleKey: roleKey, addedRoleKeys: Object.freeze(addedRoleKeys), removedRoleKeys: Object.freeze(removedRoleKeys), unchangedRoleKeys: plan.unchangedRoleKeys }); }
    }
    for (const roleKey of plan.removeRoleKeys) {
      try { await gateway.removeMemberRole({ guildId, memberId, roleId: resolved.rolesByGameId[getGameIdFromRoleKey(roleKey)].roleId }); removedRoleKeys.push(roleKey); }
      catch (error) { return Object.freeze({ ok: false, code: 'REMOVE_FAILED', failedRoleKey: roleKey, addedRoleKeys: Object.freeze(addedRoleKeys), removedRoleKeys: Object.freeze(removedRoleKeys), unchangedRoleKeys: plan.unchangedRoleKeys }); }
    }
    return Object.freeze({ ok: true, addedRoleKeys: Object.freeze(addedRoleKeys), removedRoleKeys: Object.freeze(removedRoleKeys), unchangedRoleKeys: plan.unchangedRoleKeys });
  }
  return Object.freeze({ getSelectionState, execute });
}

module.exports = { createGameRoleSelectionUseCase };
