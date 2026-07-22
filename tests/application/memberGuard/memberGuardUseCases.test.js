const assert = require('node:assert/strict');
const { createEvaluateMemberGuardUseCase } = require('../../../src/application/memberGuard/evaluateMemberGuardUseCase');
const { createGetMemberGuardStatusUseCase } = require('../../../src/application/memberGuard/getMemberGuardStatusUseCase');

const repository = { getSettings: () => ({ enabled: true, newAccountDays: 7, safeMode: false }), getStatus: () => ({ enabled: true, newAccountDays: 7, safeMode: false }) };
const evaluate = createEvaluateMemberGuardUseCase({ repository, clock: () => 100000 });
assert.equal(evaluate.execute({ guildId: 'g1', memberFacts: { memberId: 'm1', isGuest: true } }).reasonCode, 'GUEST_LOCKDOWN');
assert.throws(() => evaluate.execute({ memberFacts: {} }), /guildId/);
const status = createGetMemberGuardStatusUseCase({ repository, metricsReader: { getRecentJoinCount: () => 3, getRecentBlockedCount: () => 2 } });
assert.deepEqual(status.execute({ guildId: 'g1' }), { enabled: true, safeMode: false, newAccountDays: 7, recentJoinCount: 3, recentBlockedCount: 2 });
assert.throws(() => createGetMemberGuardStatusUseCase({}), /repository/);
for (const forbidden of ['discord.js', 'node:fs', 'node:path', 'process.env', 'infrastructure/', 'legacy/', 'systems/']) {
  assert.equal(require('node:fs').readFileSync(require('node:path').join(__dirname, '../../../src/application/memberGuard/evaluateMemberGuardUseCase.js'), 'utf8').includes(forbidden), false, `application must not import ${forbidden}`);
}
console.log('MemberGuard application use-case tests passed.');
