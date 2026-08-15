function createCommunityRoleMutationGateway({ resolveGuild, resolveMember } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('CommunityRoleMutationGateway requires resolveGuild');
  if (typeof resolveMember !== 'function') throw new TypeError('CommunityRoleMutationGateway requires resolveMember');

  return Object.freeze({
    async addRole({ guildId, memberId, roleName, reason }) {
      const guild = await resolveGuild(guildId);
      const member = await resolveMember({ guild, guildId, memberId });
      if (!member?.guild?.members?.me?.permissions.has(PermissionFlagsBits.ManageRoles)) return false;
      const role = member.guild.roles.cache.find((item) => item.name === roleName);
      if (!role || !role.editable || member.guild.members.me.roles.highest.comparePositionTo(role) <= 0) return false;
      await member.roles.add(role, reason).catch(() => null);
      return true;
    }
  });
}

module.exports = { createCommunityRoleMutationGateway };
const { PermissionFlagsBits } = require('discord.js');
