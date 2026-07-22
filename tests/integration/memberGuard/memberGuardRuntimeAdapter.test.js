const assert = require('node:assert/strict');
const { createMemberGuardRuntimeAdapter } = require('../../../src/adapters/memberGuard/memberGuardRuntimeAdapter');
const { createEvaluateMemberGuardUseCase } = require('../../../src/application/memberGuard/evaluateMemberGuardUseCase');

const repository = { getSettings: () => ({ enabled: true, newAccountDays: 7, safeMode: false, whitelistedRoleIds: [] }), updateSettings: () => ({}) };
const adapter = createMemberGuardRuntimeAdapter({ repository, evaluateMemberGuard: createEvaluateMemberGuardUseCase({ repository, clock: () => 1000 }), logger: { error: () => {} } });
assert.equal(adapter.getRestrictionMessage().length > 0, true);
assert.equal(adapter.getRecentJoinCount('guild-1'), 0);
assert.equal(adapter.getRecentBlockedCount('guild-1'), 0);
const guestRole = { id: 'role-1', name: '👀 訪客' };
const member = { guild: { roles: { cache: new Map([[guestRole.id, guestRole]]) } }, roles: { cache: new Map([[guestRole.id, guestRole]]) } };
assert.equal(adapter.isGuestMember(member), true);
console.log('MemberGuard runtime adapter tests passed.');
