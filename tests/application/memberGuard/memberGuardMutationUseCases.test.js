const assert = require('node:assert/strict');
const { createReleaseMemberUseCase } = require('../../../src/application/memberGuard/releaseMemberUseCase');
const { createUpdateMemberGuardSettingsUseCase } = require('../../../src/application/memberGuard/updateMemberGuardSettingsUseCase');

const repository = { getSettings: () => ({ enabled: true, guestLockdown: true }), updateSettings: (_guildId, patch) => ({ enabled: true, guestLockdown: true, ...patch }) };
const update = createUpdateMemberGuardSettingsUseCase({ repository });
assert.equal(update.execute({ guildId: 'g1', patch: { safeMode: true }, guestRoleId: 'r1' }).resultCode, 'SETTINGS_UPDATED');
assert.deepEqual(update.execute({ guildId: 'g1', patch: {}, guestRoleId: 'r1' }).permissionPlan, { action: 'APPLY_GUEST_LOCKDOWN', guildId: 'g1', guestRoleId: 'r1' });
assert.throws(() => update.execute({}), /guildId/);
const release = createReleaseMemberUseCase({ repository });
assert.equal(release.execute({ guildId: 'g1', memberId: 'm1', guestRoleId: 'guest', memberRoleId: 'member' }).resultCode, 'RELEASE_ALLOWED');
assert.equal(release.execute({ guildId: 'g1', memberId: 'm1' }).resultCode, 'RELEASE_ROLES_NOT_CONFIGURED');
assert.equal(release.execute({ guildId: 'g1' }).resultCode, 'MEMBER_ID_REQUIRED');
console.log('MemberGuard mutation application tests passed.');
