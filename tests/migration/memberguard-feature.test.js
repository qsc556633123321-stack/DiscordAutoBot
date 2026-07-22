const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const legacy = require('../../src/legacy/commands/memberguard-status');
const presentation = require('../../src/presentation/commands/memberGuardStatusCommand');

const activeService = fs.readFileSync(path.join(__dirname, '../../src/services/security/memberGuardService.js'), 'utf8');
assert.equal(activeService.includes('systems/memberGuard'), false, 'active MemberGuard service must not use the legacy system runtime');
assert.equal(activeService.includes('legacy/'), false, 'active MemberGuard service must not import legacy');
assert.equal(legacy.execute, presentation.execute);
assert.deepEqual(legacy.data.toJSON(), presentation.data.toJSON());
console.log('MemberGuard vertical-slice migration regression tests passed.');
