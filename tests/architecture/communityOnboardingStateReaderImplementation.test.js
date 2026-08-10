const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const source = fs.readFileSync(path.join(root, 'src', 'infrastructure', 'community', 'CommunityOnboardingStateReader.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
for (const forbidden of ['discord.js', 'communityConcierge', 'CommunityPublication', 'fromLegacyPublicationRecord', 'guideMessageId', 'roadmapMessageId', 'guideChannelId', 'saveOnboarding', 'persist', 'writeJson', 'updatedAt', 'existsSync', 'mkdirSync', 'writeFileSync', 'ensureFile', 'ENOENT', 'console.']) {
  assert.equal(source.includes(forbidden), false, `Reader must not own ${forbidden}`);
}
assert.equal(fs.existsSync(path.join(root, 'src', 'composition', 'communityOnboardingStateReaderFeature.js')), false);
assert.equal((runtime.match(/function readOnboardingData\(/g) || []).length, 1);
assert.equal((runtime.match(/\breadOnboardingData\b/g) || []).length, 4);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1);
const changedProduction = execFileSync('git', ['status', '--short'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean).map((line) => line.slice(3).trim())
  .filter((file) => file.startsWith('src/'));
assert.equal(changedProduction.every((file) => file === 'src/infrastructure/community/CommunityOnboardingStateReader.js'), true);
console.log('Production onboarding state reader is infrastructure-only, pure delegation, and not runtime-wired.');
