const assert = require('node:assert/strict');
const { createCommandAuditReport } = require('../../../src/domain/audit/commandAuditReport');

const source = { implemented: ['dev'], invalid: [{ file: 'x.js', reason: 'missing' }], documentedOnly: null, undocumented: undefined, main: ['dev'], aliases: ['legacy'], deployMode: 'command-registry' };
const report = createCommandAuditReport(source);
assert.deepEqual(report, { implemented: ['dev'], invalid: [{ file: 'x.js', reason: 'missing' }], documentedOnly: [], undocumented: [], main: ['dev'], aliases: ['legacy'], deployMode: 'command-registry' });
assert.notEqual(report.implemented, source.implemented);
console.log('Audit domain tests passed.');
