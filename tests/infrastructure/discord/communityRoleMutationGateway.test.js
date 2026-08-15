const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createCommunityRoleMutationGateway } = require('../../../src/infrastructure/discord/communityRoleMutationGateway');

void (async () => {
function createMember({ manageRoles = true, role = { editable: true }, hierarchy = 1, rejectAdd = false } = {}) {
  const calls = { add: [] };
  const guild = { members: { me: { permissions: { has: (permission) => permission === PermissionFlagsBits.ManageRoles && manageRoles }, roles: { highest: { comparePositionTo: () => hierarchy } } } }, roles: { cache: { find: () => role } } };
  const member = { guild, roles: { add: async (...args) => { calls.add.push(args); if (rejectAdd) throw new Error('rejected'); } } };
  return { calls, guild, member };
}

async function addWith(options) {
  const { calls, guild, member } = createMember(options);
  const gateway = createCommunityRoleMutationGateway({ resolveGuild: async () => guild, resolveMember: async () => member });
  return { calls, result: await gateway.addRole({ guildId: 'g', memberId: 'm', roleName: 'role', reason: 'Community concierge quick role' }) };
}

for (const options of [{}, { rejectAdd: true }]) {
  const { calls, result } = await addWith(options);
  assert.equal(result, true); assert.equal(calls.add.length, 1);
  assert.equal(calls.add[0][1], 'Community concierge quick role');
}
for (const options of [{ manageRoles: false }, { role: null }, { role: { editable: false } }, { hierarchy: 0 }]) {
  const { calls, result } = await addWith(options);
  assert.equal(result, false); assert.equal(calls.add.length, 0);
}
const missing = createCommunityRoleMutationGateway({ resolveGuild: async () => null, resolveMember: async () => null });
assert.equal(await missing.addRole({ guildId: 'g', memberId: 'm', roleName: 'role', reason: 'reason' }), false);
console.log('Community role mutation gateway preserves cache lookup, hierarchy checks, add-only mutation, and swallowed rejection semantics.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
