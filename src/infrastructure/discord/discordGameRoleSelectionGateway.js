function createDiscordGameRoleSelectionGateway({
  resolveGuild,
  resolveMember,
  gameRegistry,
  parentGameRoleName,
  getGameRoleKey,
  getGameRoleName
} = {}) {
  if (typeof resolveGuild !== 'function' || typeof resolveMember !== 'function') throw new TypeError('DiscordGameRoleSelectionGateway requires resolvers');
  if (!Array.isArray(gameRegistry) || typeof parentGameRoleName !== 'string' || typeof getGameRoleKey !== 'function' || typeof getGameRoleName !== 'function') {
    throw new TypeError('DiscordGameRoleSelectionGateway requires game role definitions');
  }
  async function memberFor(guildId, memberId) { const guild = await resolveGuild(guildId); return resolveMember({ guild, guildId, memberId }); }
  return Object.freeze({
    async getMemberRoleState({ guildId, memberId }) {
      const member = await memberFor(guildId, memberId);
      const names = new Set(member?.roles?.cache?.map((role) => role.name) || []);
      return Object.freeze({ hasParentGameRole: names.has(parentGameRoleName), currentSpecificGameRoleKeys: Object.freeze(gameRegistry.filter((game) => names.has(getGameRoleName(game))).map((game) => getGameRoleKey(game.id))) });
    },
    async resolveSpecificGameRoles({ guildId, gameIds }) {
      const guild = await resolveGuild(guildId);
      const rolesByGameId = {}; const missingGameIds = []; const unmanageableGameIds = [];
      for (const gameId of gameIds) {
        const game = gameRegistry.find((item) => item.id === gameId);
        const role = game && guild?.roles?.cache?.find((item) => item.name === getGameRoleName(game));
        if (!role) missingGameIds.push(gameId);
        else if (!role.editable) unmanageableGameIds.push(gameId);
        else rolesByGameId[gameId] = Object.freeze({ roleId: role.id });
      }
      return Object.freeze({ rolesByGameId: Object.freeze(rolesByGameId), missingGameIds: Object.freeze(missingGameIds), unmanageableGameIds: Object.freeze(unmanageableGameIds) });
    },
    async addMemberRole({ guildId, memberId, roleId }) { const member = await memberFor(guildId, memberId); return member.roles.add(roleId, 'Game role selection'); },
    async removeMemberRole({ guildId, memberId, roleId }) { const member = await memberFor(guildId, memberId); return member.roles.remove(roleId, 'Game role selection'); }
  });
}

module.exports = { createDiscordGameRoleSelectionGateway };
