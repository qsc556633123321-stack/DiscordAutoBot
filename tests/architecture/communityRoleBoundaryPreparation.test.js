const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const candidate = fs.readFileSync(path.join(root, 'tests', 'fakes', 'community', 'FakeCommunityRoleQuickActionCandidate.js'), 'utf8');
assert.equal(runtime.includes('async function maybeAddRole'), false);
assert.equal(runtime.includes('async function handleConciergeButton'), true);
assert.equal((runtime.match(/createCommunityRoleQuickActionFeature/g) || []).length, 3);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.equal((runtime.match(/member\.roles\.remove\(/g) || []).length, 0);
assert.equal(candidate.includes('discord.js'), false);
assert.equal(candidate.includes('src/'), false);
const productionDiff = [
  execFileSync('git', ['diff', '--name-only', 'HEAD', '--', 'src'], { cwd: root, encoding: 'utf8' }),
  execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
].join('\n').trim().split(/\r?\n/).filter(Boolean).sort();
for (const roleBoundaryFile of [
  'src/application/community/communityRoleQuickActionUseCase.js',
  'src/application/community/ports/CommunityRoleMutationGateway.js',
  'src/composition/communityRoleQuickActionFeature.js',
  'src/infrastructure/discord/communityRoleMutationGateway.js'
]) {
  assert.equal(productionDiff.includes(roleBoundaryFile), false, `${roleBoundaryFile} must remain unchanged`);
}
console.log('Community role boundary preparation recognizes the committed role boundary source truth.');
