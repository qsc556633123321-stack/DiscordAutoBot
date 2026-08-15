const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests/fakes/community/FakeCommunityChannelSetupBoundaryCandidate.js'), 'utf8');
const srcDiff = [
  ...childProcess.execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean),
  ...childProcess.execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean)
];
assert.deepEqual([...new Set(srcDiff)].sort(), []);
for (const token of ['getOrCreateCategory', 'getOrCreateGuideChannel', 'getOrCreateRoadmapChannel', 'guild.channels.create', 'permissionOverwrites.set', 'channel.setParent']) assert.match(runtime, new RegExp(token.replace(/[.]/g, '\\.')));
for (const forbidden of ['interaction.', 'createCommunityRoleQuickActionFeature', 'node:fs', 'createCommunityPublicationStateFeature', 'console.']) assert.equal(candidate.includes(forbidden), false);
assert.match(candidate, /catch\(\(\) => null\)/);
assert.match(runtime, /buildCommunityRoleConciergePresentationPayload/);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
console.log('Community channel setup preparation freezes the runtime-owned Concierge setup surface without production changes.');
