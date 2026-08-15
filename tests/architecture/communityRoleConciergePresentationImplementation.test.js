const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const runtime = fs.readFileSync(path.join(root, 'src/systems/communityConcierge.js'), 'utf8');
const builderPath = path.join(root, 'src/modules/community/CommunityRoleConciergePresentation.js');
const builder = fs.readFileSync(builderPath, 'utf8');
const sourceDiff = childProcess.execFileSync('git', ['diff', '--name-only', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split(/\r?\n/).filter(Boolean);

assert.equal(fs.existsSync(builderPath), true);
assert.deepEqual(sourceDiff.filter((item) => ![
  'src/modules/community/CommunityRoleConciergePresentation.js',
  'src/systems/communityConcierge.js'
].includes(item)), []);
assert.match(builder, /require\(['"]discord\.js['"]\)/);
for (const forbidden of ['interaction.reply', 'interaction.customId', 'resolveCommunityConciergeButtonAction', 'createCommunityRoleQuickActionFeature', 'roles.add', 'member.roles', 'guild.roles', 'node:fs', 'console.']) {
  assert.equal(builder.includes(forbidden), false, `builder must not depend on ${forbidden}`);
}
assert.match(runtime, /CommunityRoleConciergePresentation/);
for (const action of ['games', 'invest', 'dev']) assert.match(builder, new RegExp(`action === '${action}'`));
const roleBlock = runtime.slice(runtime.indexOf("if (action === 'games')"), runtime.indexOf("if (action === 'roadmap')"));
assert.equal((roleBlock.match(/buildCommunityRoleConciergePresentationPayload/g) || []).length, 2);
assert.equal((roleBlock.match(/new EmbedBuilder/g) || []).length, 0);
assert.equal((roleBlock.match(/member\.roles\.add/g) || []).length, 0);
assert.match(runtime, /buildCommunityNonRoleConciergePresentationPayload/);
assert.match(runtime, /function quickLinks\(guild, kind\)/);
console.log('Production role Concierge presentation is Module-owned while workflow, quick links, replies, and dispatch remain protected.');
