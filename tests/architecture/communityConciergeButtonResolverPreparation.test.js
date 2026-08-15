const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const legacy = fs.readFileSync(path.join(root, 'src', 'legacy', 'interactions', 'legacyInteractionRuntime.js'), 'utf8');
const dispatchHandler = fs.readFileSync(path.join(root, 'src', 'modules', 'interactions', 'buttonHandlers', 'communityConciergeButtons.js'), 'utf8');
const runtime = fs.readFileSync(path.join(root, 'src', 'systems', 'communityConcierge.js'), 'utf8');
const resolver = fs.readFileSync(path.join(root, 'src', 'application', 'community', 'CommunityConciergeButtonActionResolver.js'), 'utf8');
assert.equal(legacy.includes("startsWith('concierge_')"), false);
assert.equal(legacy.includes('handleConciergeButton'), false);
assert.match(dispatchHandler, /customId\.startsWith\(CONCIERGE_PREFIX\)/);
assert.match(dispatchHandler, /console\.error\('Concierge button failed:', error\)/);
assert.match(dispatchHandler, /!interaction\.replied && !interaction\.deferred/);
assert.equal((runtime.match(/member\.roles\.add\(/g) || []).length, 0);
assert.match(runtime, /resolveCommunityConciergeButtonAction\(interaction\.customId\)/);
for (const customId of ['concierge_games', 'concierge_invest', 'concierge_dev', 'concierge_night', 'concierge_bot', 'concierge_roadmap']) {
  assert.equal(resolver.includes(customId), true);
  assert.equal(runtime.includes(customId), false);
}
assert.match(runtime, /return false;/);
for (const name of ['setupCommunityGuide', 'setupRoadmapPanel', 'sendConciergeWelcome']) {
  assert.equal(runtime.includes(`async function ${name}`), true);
}
for (const forbidden of ['discord.js', 'interaction', 'Guild', 'GuildMember', 'EmbedBuilder', 'CommunityRoleQuickAction', 'quickLinks', 'buildRoadmapEmbed', 'reply(', 'console.', 'node:fs', 'database']) {
  assert.equal(resolver.includes(forbidden), false);
}
console.log('Concierge button resolver implementation preserves modern dispatch, runtime presentation, and Application mapping ownership.');
