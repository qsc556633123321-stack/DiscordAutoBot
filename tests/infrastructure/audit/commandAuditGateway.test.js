const assert = require('node:assert/strict');
const { createCommandAuditGateway } = require('../../../src/infrastructure/project/commandAuditGateway');

const expected = { implemented: ['dev-audit-commands'] };
const gateway = createCommandAuditGateway({ auditRunner: () => expected });
assert.equal(gateway.audit(), expected);
assert.throws(() => createCommandAuditGateway({ auditRunner: () => { throw new Error('audit failed'); } }).audit(), /audit failed/);
console.log('Audit infrastructure gateway tests passed.');
