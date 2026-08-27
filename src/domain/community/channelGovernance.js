const ChannelOwnership = Object.freeze({ MANAGED_CANONICAL: 'MANAGED_CANONICAL', MANAGED_RUNTIME: 'MANAGED_RUNTIME', USER_MANAGED: 'USER_MANAGED', SYSTEM_PROTECTED: 'SYSTEM_PROTECTED', UNKNOWN: 'UNKNOWN' });
const ChannelLifecycle = Object.freeze({ PERSISTENT: 'persistent', RUNTIME: 'runtime', TEMPORARY: 'temporary', DEPRECATED: 'deprecated', UNKNOWN: 'unknown' });
const ChannelPurpose = Object.freeze({ ENTRY: 'entry', RULES: 'rules', WELCOME: 'welcome', ANNOUNCEMENT: 'announcement', GENERAL_CHAT: 'general_chat', COMMUNITY_CHAT: 'community_chat', GAME_CENTER: 'game_center', GAME_CHAT: 'game_chat', GAME_LFG: 'game_lfg', GAME_INFO: 'game_info', GAME_VOICE_ENTRY: 'game_voice_entry', INTEREST: 'interest', EVENT: 'event', ADMIN: 'admin', BOT_LOG: 'bot_log', TICKET: 'ticket', RUNTIME_VOICE: 'runtime_voice', UNKNOWN: 'unknown' });
const GovernanceAction = Object.freeze({ KEEP: 'KEEP', CREATE: 'CREATE', MOVE: 'MOVE', RENAME: 'RENAME', PERMISSION_CHANGE: 'PERMISSION_CHANGE', SAFE_DELETE: 'SAFE_DELETE', REVIEW_DELETE: 'REVIEW_DELETE', REVIEW: 'REVIEW', CONFLICT: 'CONFLICT' });
const PermissionProfile = Object.freeze({ PUBLIC_ENTRY: 'public_entry', PUBLIC_READONLY: 'public_readonly', MEMBER_DISCUSSION: 'member_discussion', GAME_CENTER: 'game_center', GAME_READONLY: 'game_readonly', SPECIFIC_GAME: 'specific_game', READONLY_INFO: 'readonly_info', VOICE_ENTRY: 'voice_entry', ADMIN: 'admin', BOT_INTERNAL: 'bot_internal' });
const PERMISSION_PROFILE_CAPABILITIES = Object.freeze({
  [PermissionProfile.PUBLIC_ENTRY]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: false, Speak: false }),
  [PermissionProfile.PUBLIC_READONLY]: Object.freeze({ ViewChannel: true, SendMessages: false, Connect: false, Speak: false }),
  [PermissionProfile.MEMBER_DISCUSSION]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: false, Speak: false }),
  [PermissionProfile.GAME_CENTER]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: false, Speak: false }),
  [PermissionProfile.GAME_READONLY]: Object.freeze({ ViewChannel: true, SendMessages: false, Connect: false, Speak: false }),
  [PermissionProfile.SPECIFIC_GAME]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: false, Speak: false }),
  [PermissionProfile.READONLY_INFO]: Object.freeze({ ViewChannel: true, SendMessages: false, Connect: false, Speak: false }),
  [PermissionProfile.VOICE_ENTRY]: Object.freeze({ ViewChannel: true, SendMessages: false, Connect: true, Speak: true }),
  [PermissionProfile.ADMIN]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: true, Speak: true }),
  [PermissionProfile.BOT_INTERNAL]: Object.freeze({ ViewChannel: true, SendMessages: true, Connect: true, Speak: true })
});
const DELETE_POLICIES = new Set(['managed_only', 'never', 'replacement_required', 'review_only']);
const ACTIONS = new Set(Object.values(GovernanceAction));

function createGovernedResource(spec = {}) {
  if (typeof spec.key !== 'string' || !spec.key) throw new TypeError('Governed resource requires key');
  if (typeof spec.displayName !== 'string' || !spec.displayName) throw new TypeError('Governed resource requires displayName');
  if (!DELETE_POLICIES.has(spec.deletePolicy)) throw new TypeError('Governed resource requires supported deletePolicy');
  return Object.freeze({ key: spec.key, displayName: spec.displayName, type: spec.type, purpose: spec.purpose || ChannelPurpose.UNKNOWN, owner: spec.owner || ChannelOwnership.UNKNOWN, parentKey: spec.parentKey || null, accessProfile: spec.accessProfile || null, accessRoleKey: spec.accessRoleKey || null, lifecycle: spec.lifecycle || ChannelLifecycle.UNKNOWN, importance: spec.importance || 'normal', deletePolicy: spec.deletePolicy, legacyNames: Object.freeze([...(spec.legacyNames || [])]) });
}

function createGovernanceAction(action, payload = {}) {
  if (!ACTIONS.has(action)) throw new TypeError(`Unsupported governance action: ${action}`);
  return Object.freeze({ action, ...payload });
}

function isProtectedResource(resource = {}) {
  return resource.owner === ChannelOwnership.SYSTEM_PROTECTED || resource.owner === ChannelOwnership.MANAGED_RUNTIME || [ChannelLifecycle.RUNTIME, ChannelLifecycle.TEMPORARY].includes(resource.lifecycle) || [ChannelPurpose.TICKET, ChannelPurpose.RUNTIME_VOICE].includes(resource.purpose);
}

module.exports = { ChannelLifecycle, ChannelOwnership, ChannelPurpose, GovernanceAction, PERMISSION_PROFILE_CAPABILITIES, PermissionProfile, createGovernanceAction, createGovernedResource, isProtectedResource };
