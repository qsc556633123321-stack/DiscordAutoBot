const { PermissionFlagsBits } = require('discord.js');

const MANAGEMENT_PERMISSIONS = {
  channels: PermissionFlagsBits.ManageChannels,
  guild: PermissionFlagsBits.ManageGuild,
  roles: PermissionFlagsBits.ManageRoles
};

function hasPermissions(memberPermissions, required = []) {
  return required.every((permission) => memberPermissions?.has(permission));
}

module.exports = { MANAGEMENT_PERMISSIONS, hasPermissions };
