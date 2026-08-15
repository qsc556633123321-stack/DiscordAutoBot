const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const router = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonInteractionHandler.js'), 'utf8');
const handler = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonHandlers', 'communityConciergeButtons.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const resolver = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'CommunityConciergeButtonActionResolver.js'), 'utf8');

assert.equal(legacy.includes("startsWith('concierge_')"), false);
assert.equal(legacy.includes('handleConciergeButton'), false);
assert.match(router, /communityConciergeButtons/);
assert.match(handler, /typeof customId === 'string' && customId\.startsWith\(CONCIERGE_PREFIX\)/);
assert.equal((handler.match(/await handleConciergeButton\(interaction\)/g) || []).length, 1);
assert.equal(handler.includes('if (await handleConciergeButton'), false);
assert.match(handler, /console\.error\('Concierge button failed:', error\)/);
assert.match(handler, /!interaction\.replied && !interaction\.deferred/);
assert.match(handler, /ephemeral: true/);
assert.match(handler, /處理互動導覽時發生錯誤，請稍後再試。/);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
for (const closedFlow of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) assert.equal(runtime.includes(`async function ${closedFlow}`), true);
assert.match(resolver, /concierge_games/);
for (const unchanged of [
  'src/application/community/CommunityConciergeButtonActionResolver.js',
  'src/systems/communityConcierge.js',
  'src/application/community/communityRoleQuickActionUseCase.js',
  'src/application/community/ports/CommunityRoleMutationGateway.js',
  'src/composition/communityRoleQuickActionFeature.js',
  'src/infrastructure/discord/communityRoleMutationGateway.js'
]) {
  assert.equal(execFileSync('git', ['diff', '--name-only', 'HEAD', '--', unchanged], { cwd: root, encoding: 'utf8' }).trim(), '', `${unchanged} must remain unchanged in this slice`);
}
console.log('Community button dispatch boundary has one modern Concierge owner and preserves all protected boundaries.');
