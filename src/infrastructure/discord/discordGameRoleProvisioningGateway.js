const { PermissionFlagsBits } = require('discord.js');

function createDiscordGameRoleProvisioningGateway({ resolveGuild } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('DiscordGameRoleProvisioningGateway requires resolveGuild');

  async function guildFor(guildId) {
    const guild = await resolveGuild(guildId);
    if (!guild) throw Object.assign(new Error('Guild not found'), { code: 'GUILD_NOT_FOUND' });
    return guild;
  }

  return Object.freeze({
    async preflightManageRoles({ guildId }) {
      const guild = await guildFor(guildId);
      const canManageRoles = Boolean(guild.members?.me?.permissions?.has(PermissionFlagsBits.ManageRoles));
      return Object.freeze({ canManageRoles, code: canManageRoles ? null : 'PERMISSION_DENIED' });
    },

    async findRolesByExactName({ guildId, name }) {
      const guild = await guildFor(guildId);
      return guild.roles.cache
        .filter((role) => role.name === name)
        .map((role) => Object.freeze({ roleId: role.id, roleName: role.name }));
    },

    async createRole({ guildId, roleName }) {
      const guild = await guildFor(guildId);
      const role = await guild.roles.create({
        name: roleName,
        permissions: [],
        mentionable: false,
        hoist: false,
        reason: 'Game role provisioning'
      });
      return Object.freeze({ roleId: role.id, roleName: role.name });
    },

    async deleteRole({ guildId, roleId }) {
      const guild = await guildFor(guildId);
      const role = guild.roles.cache.get(roleId);
      if (!role) throw Object.assign(new Error('Role not found'), { code: 'ROLE_NOT_FOUND' });
      await role.delete('Game role provisioning rollback');
      return Object.freeze({ roleId });
    }
  });
}

module.exports = { createDiscordGameRoleProvisioningGateway };
