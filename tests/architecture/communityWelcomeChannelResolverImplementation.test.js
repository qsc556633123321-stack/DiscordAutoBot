const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const resolverPath = path.join(root, 'src', 'infrastructure', 'community', 'CommunityWelcomeChannelResolver.js');
const source = fs.readFileSync(resolverPath, 'utf8');
for (const forbidden of ['../application', '../../application', '../composition', '../../composition', 'node:fs', 'node:path', 'ONBOARDING_FILE', 'readJson', 'readTrackedChannel', 'CommunityPublicationChannelTracking', 'sendConciergeWelcome', 'member.send', 'payload', 'console.', 'logger']) {
  assert.equal(source.includes(forbidden), false, `Resolver must not own ${forbidden}`);
}
assert.equal(source.includes('Object.freeze'), true);
assert.equal(source.includes('createCommunityWelcomeChannelResolver'), true);
const changedSource = execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
const allowedSource = 'src/infrastructure/community/CommunityWelcomeChannelResolver.js';
assert.equal(fs.existsSync(resolverPath), true, 'Resolver production source must exist');
assert.equal(
  changedSource.every((file) => file === allowedSource),
  true,
  'Only the resolver production source may be modified by this slice'
);
console.log('Community Welcome channel resolver remains Infrastructure-only and isolated from runtime, tracking, filesystem, and DM delivery.');
