const { PermissionProfile } = require('./channelGovernance');
function canRoleKeysAccessResource(roleKeys = [], resource = {}) {
  const roles = new Set(roleKeys);
  if ([PermissionProfile.PUBLIC_ENTRY, PermissionProfile.PUBLIC_READONLY].includes(resource.accessProfile)) return true;
  if (resource.accessRoleKey) return roles.has(resource.accessRoleKey) || ['admin', 'mod', 'owner'].some((key) => roles.has(key));
  if (resource.accessProfile === PermissionProfile.SPECIFIC_GAME) return roles.has(resource.accessRoleKey);
  if (resource.accessProfile === PermissionProfile.GAME_CENTER) return ['game', 'admin', 'mod', 'owner'].some((key) => roles.has(key));
  if ([PermissionProfile.ADMIN, PermissionProfile.BOT_INTERNAL].includes(resource.accessProfile)) return ['owner', 'admin', 'mod'].some((key) => roles.has(key));
  return ['member', 'admin', 'mod', 'owner'].some((key) => roles.has(key));
}
module.exports = { canRoleKeysAccessResource };
