const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createJsonMemberGuardRepository } = require('../../../src/infrastructure/storage/jsonMemberGuardRepository');

const filePath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'memberguard-')), 'settings.json');
const repository = createJsonMemberGuardRepository({ filePath });
assert.equal(repository.getSettings('guild-1').enabled, true);
repository.updateSettings('guild-1', { enabled: false, whitelistedRoleIds: ['123456789012345678', '123456789012345678'] });
assert.equal(repository.isEnabled('guild-1'), false);
assert.deepEqual(repository.listAllowedRoleIds('guild-1'), ['123456789012345678']);
assert.deepEqual(repository.listProtectedMemberIds('missing'), []);
fs.rmSync(path.dirname(filePath), { recursive: true, force: true });
console.log('MemberGuard JSON repository tests passed.');
