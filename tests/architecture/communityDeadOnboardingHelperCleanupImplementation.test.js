const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const exportsBlock = runtime.slice(runtime.indexOf('module.exports'));

for (const helper of ['readOnboardingData', 'saveOnboarding']) {
  assert.equal(runtime.includes(helper), false, `${helper} must be absent from production runtime`);
  assert.equal(exportsBlock.includes(helper), false, `${helper} must not alter module exports`);
}

for (const required of ['ONBOARDING_FILE', 'function ensureFile(', 'function readJson(']) {
  assert.equal(runtime.includes(required), true, `${required} remains runtime-owned`);
}

const guide = runtime.slice(runtime.indexOf('async function setupCommunityGuide'), runtime.indexOf('async function setupRoadmapPanel'));
const roadmap = runtime.slice(runtime.indexOf('async function setupRoadmapPanel'), runtime.indexOf('function maybeAddRole'));
const welcome = runtime.slice(runtime.indexOf('async function sendConciergeWelcome'), runtime.indexOf('module.exports'));
for (const [name, source, adapter] of [
  ['Guide', guide, 'createCommunityPublicationTrackingReadCompatibilityAdapter'],
  ['Roadmap', roadmap, 'createCommunityPublicationTrackingReadCompatibilityAdapter'],
  ['Welcome', welcome, 'createCommunityPublicationChannelTrackingReadCompatibilityAdapter']
]) {
  assert.equal((source.match(/createCommunityOnboardingStateReader\(/g) || []).length, 1, `${name} constructs one reader`);
  assert.equal(source.includes(adapter), true, `${name} retains its tracking adapter`);
}

const changedSource = execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changedSource, ['src/systems/communityConcierge.js']);
console.log('Dead onboarding helper cleanup preserves reader-backed Guide, Roadmap, and Welcome runtime ownership.');
