const assert = require('node:assert/strict');
const fs = require('node:fs'); const path = require('node:path'); const root = path.resolve(__dirname, '..', '..');
const command = fs.readFileSync(path.join(root, 'src/presentation/commands/serverGovernanceDryRunCommand.js'), 'utf8');
const release = fs.readFileSync(path.join(root, 'src/domain/community/serverGovernanceReleaseCandidate.js'), 'utf8');
const ready = fs.readFileSync(path.join(root, 'src/events/ready.js'), 'utf8');
const collisionAudit = fs.readFileSync(path.join(root, 'docs/architecture/SERVER_GOVERNANCE_LEGACY_COLLISION.md'), 'utf8');
assert.equal(/channels\.create|channel\.setName\(|channel\.setParent\(|permissionOverwrites\.|channel\.delete\(/.test(command), false);
assert.equal(/discord\.js|node:fs/.test(release), false);
assert.equal(release.includes('ARCHIVE_RESOURCE'), true);
assert.equal(/serverGovernance|rebuild|organize|permissionOverwrites/.test(ready), false);
for (const commandName of ['auto-organize', 'deep-cleanup', 'rebuild-server', 'factory-reset-server', 'ai-reorganize-server', 'restore-active-channels', 'apply-role-permissions']) {
  assert.equal(collisionAudit.includes(commandName), true);
}
assert.equal(collisionAudit.includes('PHASE_4_REWORK_REQUIRED'), true);
console.log('Server governance release-candidate architecture boundary tests passed.');
