const assert = require('node:assert/strict');
const { createRunCommandAuditUseCase } = require('../../../src/application/audit/runCommandAuditUseCase');

assert.throws(() => createRunCommandAuditUseCase(), /gateway is required/);
const useCase = createRunCommandAuditUseCase({ gateway: { audit: () => ({ implemented: ['dev'], deployMode: 'registry' }) } });
assert.deepEqual(useCase.execute(), { implemented: ['dev'], invalid: [], documentedOnly: [], undocumented: [], main: [], aliases: [], deployMode: 'registry' });
console.log('Audit application tests passed.');
