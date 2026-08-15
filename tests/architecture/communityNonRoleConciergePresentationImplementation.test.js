const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const builderPath = path.join(root, 'src', 'modules', 'community', 'CommunityNonRoleConciergePresentation.js');
const runtimePath = path.join(root, 'src', 'systems', 'communityConcierge.js');
const builder = fs.readFileSync(builderPath, 'utf8');
const runtime = fs.readFileSync(runtimePath, 'utf8');
const sourceDiff = [...new Set([
  ...childProcess.execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
    .trim().split(/\r?\n/).filter(Boolean),
  ...childProcess.execFileSync('git', ['ls-files', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
    .trim().split(/\r?\n/).filter(Boolean)
])].sort();

assert.deepEqual(sourceDiff, [
  'src/modules/community/CommunityNonRoleConciergePresentation.js',
  'src/systems/communityConcierge.js'
]);
assert.match(builder, /require\(['"]discord\.js['"]\)/);
for (const forbidden of ['interaction.reply', 'customId', 'resolveCommunityConciergeButtonAction', 'createCommunityRoleQuickActionFeature', 'roles.add', 'node:fs']) {
  assert.equal(builder.includes(forbidden), false, `builder must not depend on ${forbidden}`);
}
assert.match(builder, /buildRoadmapEmbed\(\)/);
assert.doesNotMatch(builder, /catch \(/);
assert.match(runtime, /require\('\.\.\/modules\/community\/CommunityNonRoleConciergePresentation'\)/);

for (const action of ['night', 'bot', 'roadmap']) {
  const start = runtime.indexOf(`if (action === '${action}')`);
  const next = runtime.indexOf("if (action === '", start + 1);
  const branch = runtime.slice(start, next === -1 ? undefined : next);
  assert.match(branch, /buildCommunityNonRoleConciergePresentationPayload/);
  assert.match(branch, /await interaction\.reply\(payload\)/);
  assert.doesNotMatch(branch, /new EmbedBuilder/);
}
const nightStart = runtime.indexOf("if (action === 'night')");
const botStart = runtime.indexOf("if (action === 'bot')");
assert.match(runtime.slice(nightStart, botStart), /quickLinks\(guild, 'night'\)/);
assert.match(runtime, /function buildRoadmapEmbed\(\)/);
for (const action of ['games', 'invest', 'dev']) {
  const start = runtime.indexOf(`if (action === '${action}'`);
  const next = runtime.indexOf("if (action === '", start + 1);
  assert.doesNotMatch(runtime.slice(start, next === -1 ? undefined : next), /buildCommunityNonRoleConciergePresentationPayload/);
}
for (const protectedPath of [
  'src/modules/interactions/buttonHandlers/communityConciergeButtons.js',
  'src/modules/interactions/buttonInteractionHandler.js',
  'src/legacy/interactions/legacyInteractionRuntime.js',
  'src/application/community/CommunityConciergeButtonActionResolver.js',
  'src/application/community/CommunityRoleQuickActionUseCase.js',
  'src/infrastructure/discord/CommunityRoleMutationGateway.js',
  'src/composition/communityRoleQuickActionFeature.js'
]) {
  const diff = childProcess.execFileSync('git', ['diff', '--', protectedPath], { cwd: root, encoding: 'utf8' });
  assert.equal(diff, '', `${protectedPath} must remain unchanged`);
}
console.log('Production non-role Concierge presentation builder is isolated and redirects only approved payload construction.');
