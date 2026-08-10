const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const port = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityPublicationTrackingReadPort.js'), 'utf8');
const adapter = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityPublicationTrackingReadCompatibilityAdapter.js'), 'utf8');
for (const source of [port, adapter]) {
  for (const forbidden of ["require('discord.js')", "require('node:fs')", 'saveOnboarding', '.persist(', 'writeFile', 'updatedAt']) {
    assert.equal(source.includes(forbidden), false, `Test-only shared read boundary must not depend on ${forbidden}`);
  }
}
assert.equal(adapter.includes('fromLegacyPublicationRecord'), true);
assert.equal(adapter.includes('function fromLegacyPublicationRecord'), false);
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 4, 'definition plus three runtime consumers remain');
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1);
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
assert.equal(changed.filter((file) => file.startsWith('src/')).length, 0, `Preparation must not change production: ${changed.join(', ')}`);
console.log('Shared publication tracking read preparation keeps runtime, persistence, and legacy cleanup unchanged.');
