const DEFAULT_MEMBER_GUARD_SETTINGS = Object.freeze({
  enabled: true,
  guestLockdown: true,
  newAccountDays: 7,
  newAccountTimeoutMinutes: 10,
  blockEveryoneMentions: true,
  blockRoleMentions: true,
  joinBurstLimit: 10,
  joinBurstWindowSeconds: 60,
  safeMode: false,
  whitelistedRoleIds: [],
  protectedMemberIds: [],
  blockedMemberIds: []
});

const MEMBER_GUARD_ROLE_NAMES = Object.freeze({
  guest: '👀 訪客',
  formalMember: '👤 正式成員'
});

function normalizeMemberId(value) {
  const normalized = String(value || '').trim();
  return /^\d{5,}$/.test(normalized) ? normalized : null;
}

function normalizedIds(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(normalizeMemberId).filter(Boolean))];
}

function normalizeSettings(settings = {}) {
  const source = settings && typeof settings === 'object' ? settings : {};
  return {
    ...DEFAULT_MEMBER_GUARD_SETTINGS,
    ...source,
    whitelistedRoleIds: normalizedIds(source.whitelistedRoleIds),
    protectedMemberIds: normalizedIds(source.protectedMemberIds),
    blockedMemberIds: normalizedIds(source.blockedMemberIds)
  };
}

function isMemberProtected(facts = {}, settings = {}) {
  const memberId = normalizeMemberId(facts.memberId);
  const protectedIds = normalizedIds(settings.protectedMemberIds);
  return Boolean(memberId && protectedIds.includes(memberId));
}

function isMemberAllowed(facts = {}, settings = {}) {
  const roleIds = normalizedIds(facts.roleIds);
  const allowedRoleIds = normalizedIds(settings.whitelistedRoleIds);
  return roleIds.some((roleId) => allowedRoleIds.includes(roleId));
}

function isMemberBlocked(facts = {}, settings = {}) {
  const memberId = normalizeMemberId(facts.memberId);
  return Boolean(memberId && normalizedIds(settings.blockedMemberIds).includes(memberId));
}

function isNewAccount(facts = {}, settings = {}, now = Date.now()) {
  const createdTimestamp = Number(facts.createdTimestamp || 0);
  const days = Math.max(Number(settings.newAccountDays || 0), 0);
  return createdTimestamp > 0 && now - createdTimestamp < days * 24 * 60 * 60 * 1000;
}

function evaluateMemberGuard(facts = {}, storedSettings = {}, now = Date.now()) {
  const settings = normalizeSettings(storedSettings);
  if (!settings.enabled) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'DISABLED', settings };
  if (facts.isBot) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'BOT_BYPASS', settings };
  if (facts.isOwner) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'OWNER_BYPASS', settings };
  if (facts.hasAdminPermission) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'ADMIN_BYPASS', settings };
  if (isMemberProtected(facts, settings)) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'PROTECTED_MEMBER', settings };
  if (isMemberAllowed(facts, settings)) return { allowed: true, blocked: false, bypassed: true, enforce: false, reasonCode: 'ALLOWED_ROLE', settings };
  if (isMemberBlocked(facts, settings)) return { allowed: false, blocked: true, bypassed: false, enforce: true, reasonCode: 'BLOCKED_MEMBER', settings };

  const restricted = Boolean(settings.safeMode || facts.isGuest || isNewAccount(facts, settings, now));
  return {
    allowed: !restricted,
    blocked: false,
    bypassed: false,
    enforce: restricted,
    reasonCode: settings.safeMode ? 'SAFE_MODE' : facts.isGuest ? 'GUEST_LOCKDOWN' : restricted ? 'NEW_ACCOUNT' : 'ALLOWED',
    settings
  };
}

module.exports = {
  DEFAULT_MEMBER_GUARD_SETTINGS,
  MEMBER_GUARD_ROLE_NAMES,
  evaluateMemberGuard,
  isMemberAllowed,
  isMemberBlocked,
  isMemberProtected,
  isNewAccount,
  normalizeMemberId,
  normalizeSettings
};
