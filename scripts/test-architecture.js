const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const architecture = require('../src/domain/community/communityArchitectureV3');
const { roleCanAccessCategory } = require('../src/domain/community/permissionMatrix');
const { isSameGame } = require('../src/domain/games/gameIdentityService');
const { validateLayoutAction } = require('../src/config/communityRules');
const { createLegacyFacade } = require('../src/tests/fixtures/serviceFacade');
const { readJson, updateJson, writeJsonAtomic } = require('../src/infrastructure/storage/jsonStore');
const { auditCommands } = require('./audit-commands');
const { getCommandRegistry } = require('../src/modules/commands/commandRegistry');
const { isAllowedInfrastructureApplicationPortDependency } = require('./analyze-dependency-graph');

function assertUnique(items, label) {
  assert.equal(new Set(items).size, items.length, `${label} must be unique`);
}

assert.equal(architecture.version, '4.0.0-lite');
assertUnique(architecture.categories.map((item) => item.key), 'category keys');
assertUnique(architecture.channels.map((item) => item.key), 'channel keys');
assertUnique(architecture.roles.map((item) => item.key), 'role keys');
assert.equal(architecture.categories.length, 8, 'Community V4 Lite must have exactly eight main categories');
assert.deepEqual(
  architecture.categories.map((item) => item.key),
  ['entry', 'lobby', 'game_center', 'popular_games', 'player_games', 'interests', 'events', 'admin']
);
assert.deepEqual(architecture.archiveRules, { mode: 'delete', enabled: false });
assert.equal(architecture.categories.some((item) => item.key.includes('archive')), false);
assert.equal(validateLayoutAction({
  type: 'delete',
  targetName: 'unused-channel',
  classification: 'orphan_channel',
  reason: 'orphan channel'
}).allowed, true);

const guestVisible = architecture.categories.filter((item) => roleCanAccessCategory(['guest'], item.key)).map((item) => item.key).sort();
assert.deepEqual(guestVisible, ['entry']);

assert.equal(isSameGame('VALORANT', '特戰'), true);
assert.equal(isSameGame('VALORANT', '特戰英豪'), true);
assert.equal(isSameGame('VALORANT', '瓦羅蘭'), true);
assert.equal(isSameGame('League of Legends', '英雄聯盟'), true);
assert.equal(isSameGame('Counter Strike 2', 'CS2'), true);
assert.equal(isSameGame('Minecraft', 'MC'), true);
assert.equal(roleCanAccessCategory(['guest'], 'lobby'), false);
assert.deepEqual(
  architecture.gameChannels.map((channel) => channel.key),
  ['chat', 'lfg', 'info', 'voice_create']
);

const commandDir = path.join(__dirname, '..', 'src', 'commands');
const consolidatedCommands = new Set([
  'apply-role-permissions.js',
  'bootstrap-community.js',
  'check-guest-visibility.js',
  'check-onboarding-visibility.js',
  'community-architect.js',
  'fix-game-category.js',
  'polish-server-design.js',
  'rebuild-community-layout.js',
  'rebuild-community-v3.js',
  'repair-channel-permissions.js',
  'setup-channel-panels.js',
  'setup-game.js',
  'suggest-game.js'
]);
for (const file of fs.readdirSync(commandDir).filter((name) => name.endsWith('.js'))) {
  const source = fs.readFileSync(path.join(commandDir, file), 'utf8');
  assert.ok(source.split(/\r?\n/).length <= 120, `${file} exceeds 120 lines`);
  assert.equal(/permissionOverwrites\.(set|edit)/.test(source), false, `${file} writes permissions directly`);
  assert.equal(/await\s+[^\n]*\.setParent\(/.test(source), false, `${file} moves channels directly`);
  assert.equal(/await\s+[^\n]*\.setName\(/.test(source), false, `${file} renames channels directly`);
  assert.equal(/guild\.channels\.create\(/.test(source), false, `${file} creates channels directly`);
  assert.equal(/fs\.(readFileSync|writeFileSync)/.test(source), false, `${file} reads or writes JSON directly`);
  if (consolidatedCommands.has(file)) {
    assert.equal(/require\(['"]\.\.\/systems\//.test(source), false, `${file} bypasses consolidated services`);
  }
}

const communityDomainSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'domain', 'community', 'communityArchitectureV3.js'), 'utf8');
assert.equal(/require\(['"].*config\//.test(communityDomainSource), false, 'Community V3 domain must not depend on legacy config');

const storeTestFile = path.join(os.tmpdir(), `discord-community-os-${process.pid}.json`);
writeJsonAtomic(storeTestFile, { version: 1 });
updateJson(storeTestFile, (data) => ({ ...data, version: 2 }));
assert.equal(readJson(storeTestFile, {}).version, 2);
fs.unlinkSync(storeTestFile);

const facade = createLegacyFacade({ echo: (value) => value }, 'TEST');
assert.equal(typeof facade.invoke, 'function');

const compatibilityAdapters = [
  'src/config/permissionTemplates.js',
  'src/systems/communityBootstrapSystem.js',
  'src/systems/communityV3PermissionBuilder.js',
  'src/systems/gameChannels.js',
  'src/systems/guestGate.js',
  'src/systems/rolePermissions.js',
  'src/systems/serverPolisher.js',
  'src/systems/serverRebuilder.js'
];
for (const relativeFile of compatibilityAdapters) {
  const source = fs.readFileSync(path.join(__dirname, '..', relativeFile), 'utf8');
  assert.ok(source.split(/\r?\n/).length <= 4, `${relativeFile} must remain a thin compatibility adapter`);
  assert.equal(source.includes('legacy/'), true, `${relativeFile} must point to an isolated legacy implementation`);
}

const audit = auditCommands();
assert.equal(audit.invalid.length, 0, 'all command files must be loadable');
assert.equal(audit.documentedOnly.length, 0, 'documented slash commands must exist');
assert.equal(audit.main.length, 7, 'command architecture must expose seven main entrypoints');
assert.equal(audit.aliases.length, 65, 'all previous slash commands must remain as aliases');
assert.deepEqual(
  audit.main,
  ['admin', 'community', 'dev', 'game', 'panel', 'security', 'voice']
);
assert.equal(getCommandRegistry().size, 72);
assert.equal(fs.readdirSync(path.join(__dirname, '..', 'src', 'events')).filter((name) => name.endsWith('.js')).length, 6);
assert.equal(isAllowedInfrastructureApplicationPortDependency(
  { type: 'infrastructure', file: 'src/infrastructure/example/Adapter.js' },
  { type: 'application', file: 'src/application/example/ExamplePort.js' }
), true);
assert.equal(isAllowedInfrastructureApplicationPortDependency(
  { type: 'infrastructure', file: 'src/infrastructure/example/Adapter.js' },
  { type: 'application', file: 'src/application/example/ExampleUseCase.js' }
), false);

console.log(`Architecture V2 tests passed. Commands: ${audit.implemented.length}`);
