const assert = require('node:assert/strict');
const { loadAliases } = require('../../src/modules/commands/aliasRegistry');
const { getCommandRegistry } = require('../../src/modules/commands/commandRegistry');
const legacySettings = require('../../src/legacy/commands/memberguard-settings');
const legacyRelease = require('../../src/legacy/commands/memberguard-release');
const settings = require('../../src/presentation/commands/memberguardSettingsCommand');
const release = require('../../src/presentation/commands/memberguardReleaseCommand');

function responder(calls) { return { safeDeferReply: async (_i, payload) => calls.push(['defer', payload]), safeEditReply: async (_i, payload) => calls.push(['edit', payload]) }; }
function options(values) { return { getBoolean: (name) => values[name] ?? null, getInteger: (name) => values[name] ?? null, getUser: () => values.user }; }
async function main() {
  assert.deepEqual(settings.data.toJSON(), legacySettings.data.toJSON());
  assert.deepEqual(release.data.toJSON(), legacyRelease.data.toJSON());
  assert.equal(legacySettings, settings);
  assert.equal(legacyRelease, release);
  assert.equal(loadAliases().get('memberguard-settings').execute, settings.execute);
  assert.equal(loadAliases().get('memberguard-release').execute, release.execute);
  const registry = getCommandRegistry();
  assert.deepEqual(registry.get('memberguard-settings').data.toJSON(), settings.data.toJSON());
  assert.deepEqual(registry.get('memberguard-release').data.toJSON(), release.data.toJSON());
  const settingCalls = [];
  const settingsCommand = settings.createMemberguardSettingsCommand({ feature: { updateSettings: { execute: () => ({ settings: { enabled: false, guestLockdown: false, newAccountDays: 7, newAccountTimeoutMinutes: 10, blockEveryoneMentions: true, blockRoleMentions: true, joinBurstLimit: 10, joinBurstWindowSeconds: 60, safeMode: false }, permissionPlan: null }) }, createMutationGateways: () => ({}) }, responder: responder(settingCalls), logger: { error: () => {} } });
  await settingsCommand.execute({ guild: { id: 'g1', roles: { cache: { find: () => null } } }, user: { id: 'actor' }, memberPermissions: { has: () => true }, options: options({ enabled: false }) });
  assert.equal(settingCalls[0][1].ephemeral, true);
  assert.match(settingCalls[1][1], /enabled：false/);
  const releaseCalls = [];
  const releaseCommand = release.createMemberguardReleaseCommand({ feature: { releaseMember: { execute: () => ({ allowed: true, removeRoleIds: ['guest'], addRoleIds: ['member'] }) }, createMutationGateways: () => ({ memberRoleGateway: { releaseMember: async () => ({ removed: ['guest'], added: ['member'], failed: [] }) } }) }, responder: responder(releaseCalls), logger: { error: () => {} } });
  await releaseCommand.execute({ guild: { id: 'g1', roles: { cache: { find: () => null } } }, user: { id: 'actor' }, memberPermissions: { has: () => true }, options: options({ user: { id: 'u1', toString: () => '<@u1>' } }) });
  assert.equal(releaseCalls[1][1], '已解除 <@u1> 的訪客限制。');
  console.log('MemberGuard mutation migration regression tests passed.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
