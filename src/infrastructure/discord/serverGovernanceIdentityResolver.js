const { PermissionFlagsBits } = require('discord.js');

function hasAdministratorPermission(role) {
  try {
    return Boolean(role?.permissions?.has?.(PermissionFlagsBits.Administrator) || role?.permissions?.has?.('Administrator'));
  } catch {
    return false;
  }
}

function createServerGovernanceIdentityResolver({ roleNames = {} } = {}) {
  function resolveRolesByKey(guild) {
    const roles = [...(guild?.roles?.cache?.values?.() || [])];
    const resolved = {};
    for (const [key, name] of Object.entries(roleNames)) {
      if (key === 'owner') continue;
      if (key === 'everyone') {
        if (guild?.roles?.everyone?.id) resolved[key] = guild.roles.everyone.id;
        continue;
      }
      const role = roles.find((candidate) => candidate.name === name);
      if (role) resolved[key] = role.id;
    }
    if (guild?.ownerId) resolved.owner = guild.ownerId;
    const configuredAdmin = resolved.admin ? [resolved.admin] : [];
    const administrators = roles.filter(hasAdministratorPermission).map((role) => role.id);
    const adminIds = [...new Set([...configuredAdmin, ...administrators])];
    if (adminIds.length) resolved.admin = Object.freeze(adminIds);
    return Object.freeze(resolved);
  }

  return Object.freeze({ resolveRolesByKey });
}

module.exports = { createServerGovernanceIdentityResolver };
