const { ChannelOwnership, ChannelLifecycle, ChannelPurpose, GovernanceAction, PermissionProfile, isProtectedResource } = require('./channelGovernance');

const ExecutionMode = Object.freeze({ DRY_RUN: 'dry_run', EXECUTE: 'execute' });
const ExecutionStatus = Object.freeze({ SUCCESS: 'SUCCESS', SKIPPED: 'SKIPPED', BLOCKED: 'BLOCKED', FAILED: 'FAILED' });
const EXECUTABLE_ACTIONS = Object.freeze([GovernanceAction.CREATE, GovernanceAction.MOVE, GovernanceAction.RENAME, GovernanceAction.PERMISSION_CHANGE, GovernanceAction.SAFE_DELETE]);
const ORDER = Object.freeze({ CREATE_CATEGORY: 10, CREATE_CHANNEL: 20, MOVE: 30, RENAME: 40, PERMISSION_CHANGE: 50, SAFE_DELETE_CHANNEL: 60, SAFE_DELETE_CATEGORY: 70 });

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((result, key) => ({ ...result, [key]: stable(value[key]) }), {});
  return value;
}

function fingerprint(value) {
  const text = JSON.stringify(stable(value));
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  return `gov-${(hash >>> 0).toString(16)}`;
}

function resourceFingerprint(resource = {}) {
  return Object.freeze({ id: resource.id, name: resource.name, type: resource.type, parentId: resource.parentId || null, parentCanonicalKey: resource.parentCanonicalKey || null, permissionSummary: resource.permissionSummary || [] });
}

function isAutomaticDeleteAllowed(resource = {}) {
  return !isProtectedResource(resource)
    && resource.owner === ChannelOwnership.MANAGED_CANONICAL
    && ![ChannelOwnership.UNKNOWN, ChannelOwnership.USER_MANAGED, ChannelOwnership.SYSTEM_PROTECTED, ChannelOwnership.MANAGED_RUNTIME].includes(resource.owner)
    && ![ChannelLifecycle.RUNTIME, ChannelLifecycle.TEMPORARY].includes(resource.lifecycle)
    && ![ChannelPurpose.TICKET, ChannelPurpose.RUNTIME_VOICE].includes(resource.purpose);
}

function actionOrder(action, desired) {
  if (action.action === GovernanceAction.CREATE) return desired?.type === 'category' ? ORDER.CREATE_CATEGORY : ORDER.CREATE_CHANNEL;
  if (action.action === GovernanceAction.MOVE) return ORDER.MOVE;
  if (action.action === GovernanceAction.RENAME) return ORDER.RENAME;
  if (action.action === GovernanceAction.PERMISSION_CHANGE) return ORDER.PERMISSION_CHANGE;
  if (action.action === GovernanceAction.SAFE_DELETE) return desired?.type === 'category' ? ORDER.SAFE_DELETE_CATEGORY : ORDER.SAFE_DELETE_CHANNEL;
  return Number.MAX_SAFE_INTEGER;
}

function roleDirectives(resource = {}) {
  const admin = ['owner', 'admin', 'mod'];
  const allow = (roleKey, permissions) => Object.freeze({ roleKey, allow: Object.freeze(permissions), deny: Object.freeze([]) });
  const denyEveryone = Object.freeze({ roleKey: 'everyone', allow: Object.freeze([]), deny: Object.freeze(['ViewChannel']) });
  const publicView = (send) => Object.freeze(['everyone', 'guest'].map((roleKey) => Object.freeze({ roleKey, allow: Object.freeze(send ? ['ViewChannel', 'SendMessages'] : ['ViewChannel']), deny: Object.freeze(send ? [] : ['SendMessages']) })));
  const adminDirectives = admin.map((roleKey) => allow(roleKey, ['ViewChannel', 'SendMessages', 'Connect', 'Speak']));
  if (resource.accessProfile === PermissionProfile.PUBLIC_ENTRY) return publicView(true);
  if (resource.accessProfile === PermissionProfile.PUBLIC_READONLY) return publicView(false);
  if (resource.accessProfile === PermissionProfile.READONLY_INFO) {
    return Object.freeze([denyEveryone, Object.freeze({ roleKey: resource.accessRoleKey || 'member', allow: Object.freeze(['ViewChannel']), deny: Object.freeze(['SendMessages']) }), ...adminDirectives]);
  }
  if (resource.accessProfile === PermissionProfile.ADMIN || resource.accessProfile === PermissionProfile.BOT_INTERNAL) return Object.freeze([denyEveryone, ...adminDirectives]);
  if (resource.accessProfile === PermissionProfile.SPECIFIC_GAME || resource.accessProfile === PermissionProfile.VOICE_ENTRY) {
    const access = resource.accessProfile === PermissionProfile.VOICE_ENTRY ? ['ViewChannel', 'Connect', 'Speak'] : ['ViewChannel', 'SendMessages'];
    return Object.freeze([denyEveryone, allow(resource.accessRoleKey, access), ...adminDirectives]);
  }
  if (resource.accessProfile === PermissionProfile.GAME_CENTER) return Object.freeze([denyEveryone, allow('game', ['ViewChannel', 'SendMessages']), ...adminDirectives]);
  if (resource.accessRoleKey) return Object.freeze([denyEveryone, allow(resource.accessRoleKey, ['ViewChannel', 'SendMessages']), ...adminDirectives]);
  return Object.freeze([denyEveryone, allow('member', ['ViewChannel', 'SendMessages']), ...adminDirectives]);
}

function buildPermissionReconciliation(resource) {
  return Object.freeze({ targetKey: resource.key, profile: resource.accessProfile, inheritCategory: resource.type !== 'category' && ![PermissionProfile.SPECIFIC_GAME, PermissionProfile.VOICE_ENTRY, PermissionProfile.READONLY_INFO].includes(resource.accessProfile), overwrites: roleDirectives(resource) });
}

module.exports = { EXECUTABLE_ACTIONS, ExecutionMode, ExecutionStatus, ORDER, actionOrder, buildPermissionReconciliation, fingerprint, isAutomaticDeleteAllowed, resourceFingerprint };
