const assert = require('node:assert/strict');
const { createAuditFeature } = require('../../src/composition/auditFeature');

const feature = createAuditFeature({ gateway: { audit: () => ({ implemented: ['dev-audit-commands'], deployMode: 'command-registry' }) } });
assert.deepEqual(feature.runCommandAudit.execute(), { implemented: ['dev-audit-commands'], invalid: [], documentedOnly: [], undocumented: [], main: [], aliases: [], deployMode: 'command-registry' });
console.log('Audit composition tests passed.');
