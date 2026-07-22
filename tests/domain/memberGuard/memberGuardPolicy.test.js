const assert = require('node:assert/strict');
const policy = require('../../../src/domain/memberGuard/memberGuardPolicy');

const now = Date.UTC(2026, 0, 10);
const base = { enabled: true, newAccountDays: 7, whitelistedRoleIds: ['111111111111111111'], blockedMemberIds: ['222222222222222222'] };

assert.equal(policy.normalizeMemberId(' 123456789012345678 '), '123456789012345678');
assert.equal(policy.normalizeMemberId('not-an-id'), null);
assert.equal(policy.evaluateMemberGuard({ memberId: '1', isBot: true }, base, now).reasonCode, 'BOT_BYPASS');
assert.equal(policy.evaluateMemberGuard({ memberId: '1', isOwner: true }, base, now).reasonCode, 'OWNER_BYPASS');
assert.equal(policy.evaluateMemberGuard({ memberId: '1', hasAdminPermission: true }, base, now).reasonCode, 'ADMIN_BYPASS');
assert.equal(policy.evaluateMemberGuard({ memberId: '222222222222222222' }, base, now).reasonCode, 'BLOCKED_MEMBER');
assert.equal(policy.evaluateMemberGuard({ memberId: '1', roleIds: ['111111111111111111'] }, base, now).reasonCode, 'ALLOWED_ROLE');
assert.equal(policy.evaluateMemberGuard({ memberId: '1', isGuest: true }, base, now).reasonCode, 'GUEST_LOCKDOWN');
assert.equal(policy.evaluateMemberGuard({ memberId: '1' }, { ...base, enabled: false }, now).reasonCode, 'DISABLED');
assert.equal(policy.evaluateMemberGuard({ memberId: '1', createdTimestamp: now - 1000 }, base, now).reasonCode, 'NEW_ACCOUNT');
console.log('MemberGuard domain policy tests passed.');
