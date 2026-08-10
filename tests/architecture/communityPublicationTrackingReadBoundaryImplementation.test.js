const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const portPath = path.join(root, 'src/application/community/ports/CommunityPublicationTrackingReadPort.js');
const adapterPath = path.join(root, 'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js');
const port = fs.readFileSync(portPath, 'utf8');
const adapter = fs.readFileSync(adapterPath, 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');

assert.equal(fs.existsSync(portPath), true);
assert.equal(fs.existsSync(adapterPath), true);
for (const source of [port, adapter]) {
  for (const forbidden of ["require('discord.js')", "require('node:fs')", 'saveOnboarding', 'writeFile', 'updatedAt', 'communityConcierge']) {
    assert.equal(source.includes(forbidden), false, `Shared tracking read boundary must not depend on ${forbidden}`);
  }
}
assert.equal(port.includes('Unsupported publication: ${publication}'), true);
assert.equal(adapter.includes('fromLegacyPublicationRecord'), true);
assert.equal(adapter.includes('function fromLegacyPublicationRecord'), false);
assert.equal(adapter.includes('Unsupported publication'), false, 'Adapter must rely on port validation');
assert.equal(adapter.includes('readOnboardingData()'), true);
assert.equal((adapter.match(/readOnboardingData\(\)/g) || []).length, 1, 'Adapter source must have one read site');
assert.equal(fs.existsSync(path.join(root, 'src/composition/communityPublicationTrackingReadFeature.js')), false);
assert.equal((runtime.match(/readOnboardingData\(\)/g) || []).length, 4, 'definition plus Guide, Roadmap, and Welcome remain legacy-owned');
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1, 'Retained zero-consumer helper must remain');

const changed = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean)
  .map((line) => line.slice(3).trim());
const changedProduction = changed.filter((file) => file.startsWith('src/'));
const allowedProductionChanges = [
  'src/application/community/ports/CommunityPublicationTrackingReadPort.js',
  'src/infrastructure/community/CommunityPublicationTrackingReadCompatibilityAdapter.js'
];
assert.equal(
  changedProduction.every((file) => allowedProductionChanges.includes(file)),
  true,
  `Only approved production boundary files may change: ${changedProduction.join(', ')}`
);

console.log('Shared publication tracking read implementation is pure, isolated, not composed, and not runtime-wired.');
