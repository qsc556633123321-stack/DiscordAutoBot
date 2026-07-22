const assert = require('node:assert/strict');
const { createMemberGuardPermissionGateway } = require('../../../src/infrastructure/discord/memberGuardPermissionGateway');
const { createMemberRoleGateway } = require('../../../src/infrastructure/discord/memberRoleGateway');

async function main() {
  const overwrites = [];
  const channel = { name: '一般聊天', parent: null, permissionOverwrites: { edit: async (...args) => overwrites.push(args) } };
  const permissionGateway = createMemberGuardPermissionGateway({ resolveGuild: async () => ({ members: { me: { permissions: { has: () => true } } }, channels: { cache: new Map([['c1', channel]]) } }), logger: { warn: () => {} } });
  assert.deepEqual(await permissionGateway.applyGuestRestrictionsToGuild({ guildId: 'g1', guestRoleId: 'guest' }), { updated: 1, skipped: 0 });
  assert.equal(overwrites[0][0], 'guest');
  assert.equal(overwrites[0][1].ViewChannel, false);
  const failingGateway = createMemberGuardPermissionGateway({ resolveGuild: async () => ({ members: { me: { permissions: { has: () => true } } }, channels: { cache: new Map([['broken', { name: 'broken', permissionOverwrites: { edit: async () => { throw new Error('denied'); } } }]]) } }), logger: { warn: () => {} } });
  assert.deepEqual(await failingGateway.applyGuestRestrictionsToGuild({ guildId: 'g1', guestRoleId: 'guest' }), { updated: 0, skipped: 1 });
  const calls = [];
  const roleGateway = createMemberRoleGateway({ resolveGuild: async () => ({ members: { fetch: async () => ({ roles: { cache: new Map([['guest', {}]]), remove: async (id) => calls.push(['remove', id]), add: async (id) => calls.push(['add', id]) } }) } }), logger: { warn: () => {} } });
  assert.deepEqual(await roleGateway.releaseMember({ guildId: 'g1', memberId: 'm1', removeRoleIds: ['guest'], addRoleIds: ['member'] }), { removed: ['guest'], added: ['member'], failed: [], memberId: 'm1' });
  assert.deepEqual(calls, [['remove', 'guest'], ['add', 'member']]);
  const partialGateway = createMemberRoleGateway({ resolveGuild: async () => ({ members: { fetch: async () => ({ roles: { cache: new Map(), remove: async () => {}, add: async () => { throw Object.assign(new Error('denied'), { code: 'MISSING_PERMISSIONS' }); } } }) } }), logger: { warn: () => {} } });
  const partial = await partialGateway.releaseMember({ guildId: 'g1', memberId: 'm1', addRoleIds: ['member'] });
  assert.equal(partial.failed[0].code, 'MISSING_PERMISSIONS');
  console.log('MemberGuard mutation gateway tests passed.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
