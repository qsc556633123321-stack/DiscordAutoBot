const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeProductionShapeGuideTrackedStateRead.js'), 'utf8');
const start = runtime.indexOf('async function setupCommunityGuide');
const end = runtime.indexOf('async function setupRoadmapPanel');
const guideRuntime = runtime.slice(start, end);
assert.equal((guideRuntime.match(/readOnboardingData\(\)/g) || []).length, 1);
assert.equal(guideRuntime.includes('createFakeProductionShapeGuideTrackedStateRead'), false);
assert.equal((runtime.match(/function saveOnboarding\(/g) || []).length, 1);
for (const forbidden of ["require('discord.js')", "require('node:fs')", 'saveOnboarding', '.persist(', 'writeFile', 'updatedAt']) {
  assert.equal(candidate.includes(forbidden), false, `Test-only read candidate must not couple to ${forbidden}`);
}
const changed = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
assert.equal(changed.filter((file) => file.startsWith('src/')).length, 0, `Preparation must not modify production source: ${changed.join(', ')}`);
console.log('Guide read boundary preparation leaves production runtime and saveOnboarding helper unchanged.');
