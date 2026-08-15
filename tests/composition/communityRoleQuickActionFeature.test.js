const assert = require('node:assert/strict');
const { PermissionFlagsBits } = require('discord.js');
const { createCommunityRoleQuickActionFeature } = require('../../src/composition/communityRoleQuickActionFeature');

void (async () => {
let addCount = 0;
const role = { editable: true };
const guild = { members: { me: { permissions: { has: (value) => value === PermissionFlagsBits.ManageRoles }, roles: { highest: { comparePositionTo: () => 1 } } } }, roles: { cache: { find: () => role } } };
const member = { guild, roles: { add: async () => { addCount += 1; } } };
const feature = createCommunityRoleQuickActionFeature({ resolveGuild: () => guild, resolveMember: () => member });
assert.equal((await feature.communityRoleQuickAction.execute({ guildId: 'g', memberId: 'm', action: 'games' })).added, true);
assert.equal(addCount, 1);
console.log('Community role quick-action composition wires the use case to the narrow Discord gateway.');
})().catch((error) => { console.error(error); process.exitCode = 1; });
