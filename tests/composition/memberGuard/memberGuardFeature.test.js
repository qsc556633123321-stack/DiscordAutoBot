const assert = require('node:assert/strict');
const { createMemberGuardFeature } = require('../../../src/composition/memberGuardFeature');

const repository = {
  getSettings: () => ({ enabled: true, newAccountDays: 7, safeMode: false }),
  getStatus: () => ({ enabled: true, newAccountDays: 7, safeMode: false }),
  updateSettings: () => ({ enabled: true })
};
const runtimeAdapterFactory = ({ repository: injectedRepository, evaluateMemberGuard }) => ({
  getRecentJoinCount: () => 1,
  getRecentBlockedCount: () => 2,
  repository: injectedRepository,
  evaluateMemberGuard
});
const feature = createMemberGuardFeature({ repository, runtimeAdapterFactory, clock: () => 1000 });
assert.equal(feature.repository, repository);
assert.deepEqual(feature.getStatus.execute({ guildId: 'g1' }), { enabled: true, safeMode: false, newAccountDays: 7, recentJoinCount: 1, recentBlockedCount: 2 });
assert.equal(feature.evaluate.execute({ guildId: 'g1', memberFacts: { memberId: '1', isGuest: true } }).reasonCode, 'GUEST_LOCKDOWN');
console.log('MemberGuard composition tests passed.');
