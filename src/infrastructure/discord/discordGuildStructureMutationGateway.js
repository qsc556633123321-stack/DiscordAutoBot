const { ChannelType, PermissionFlagsBits } = require('discord.js');
function toInventoryType(channel) { return channel?.type === ChannelType.GuildCategory ? 'category' : channel?.type === ChannelType.GuildVoice ? 'voice' : 'text'; }
function toIdentityResource(channel) { return { id: channel.id, name: channel.name, type: toInventoryType(channel), parentId: channel.parentId || null }; }

function createDiscordGuildStructureMutationGateway({ resolveGuild, classifyResource = () => ({}), classifyInventory, roleNames = {}, resolveRolesByKey } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('DiscordGuildStructureMutationGateway requires resolveGuild');
  async function guildFor(guildId) {
    const guild = await resolveGuild(guildId);
    if (!guild) throw Object.assign(new Error('Guild not found'), { code: 'GUILD_NOT_FOUND' });
    return guild;
  }
  function roleMap(guild) {
    if (typeof resolveRolesByKey === 'function') return resolveRolesByKey(guild);
    const byKey = {};
    for (const [key, name] of Object.entries(roleNames)) {
      const role = key === 'everyone' ? guild.roles.everyone : guild.roles.cache.find((candidate) => candidate.name === name);
      if (role) byKey[key] = role.id;
    }
    return byKey;
  }
  function channelInventory(guild) {
    const channels = [...guild.channels.cache.values()];
    const stableClassifications = Object.fromEntries(channels.map((channel) => [channel.id, classifyResource(channel) || {}]));
    const resolvedClassifications = typeof classifyInventory === 'function' ? classifyInventory(channels.map(toIdentityResource), stableClassifications) || {} : {};
    return channels.map((channel) => {
      const classified = { ...(stableClassifications[channel.id] || {}), ...(resolvedClassifications[channel.id] || {}) };
      return { id: channel.id, name: channel.name, type: toInventoryType(channel), parentId: channel.parentId || null, parentCanonicalKey: classified.parentCanonicalKey || null, canonicalKey: classified.canonicalKey || null, purpose: classified.purpose || 'unknown', owner: classified.owner || 'UNKNOWN', lifecycle: classified.lifecycle || 'unknown', accessProfile: classified.accessProfile || null, accessRoleKey: classified.accessRoleKey || null, replacementKey: classified.replacementKey || null, migrationReviewReason: classified.migrationReviewReason || null, permissionSummary: [...(channel.permissionOverwrites?.cache?.values?.() || [])].map((overwrite) => ({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow?.bitfield?.toString?.() || '', deny: overwrite.deny?.bitfield?.toString?.() || '' })) };
    });
  }
  function resolveChannel(guild, resourceId) {
    const channel = guild.channels.cache.get(resourceId);
    if (!channel) throw Object.assign(new Error('Channel not found'), { code: 'CHANNEL_NOT_FOUND' });
    return channel;
  }
  function resolveParent(guild, parentKey) {
    if (!parentKey) return null;
    const channels = [...guild.channels.cache.values()];
    const stableClassifications = Object.fromEntries(channels.map((channel) => [channel.id, classifyResource(channel) || {}]));
    const resolvedClassifications = typeof classifyInventory === 'function' ? classifyInventory(channels.map(toIdentityResource), stableClassifications) || {} : {};
    const parent = channels.find((channel) => ({ ...(stableClassifications[channel.id] || {}), ...(resolvedClassifications[channel.id] || {}) }).canonicalKey === parentKey);
    if (!parent) throw Object.assign(new Error(`Parent not found: ${parentKey}`), { code: 'PARENT_NOT_FOUND' });
    return parent.id;
  }
  function overwritePayload(guild, permission) {
    const roles = roleMap(guild);
    return permission.overwrites.flatMap((directive) => {
      const principals = Array.isArray(roles[directive.roleKey]) ? roles[directive.roleKey] : [roles[directive.roleKey]];
      return principals.filter(Boolean).map((id) => ({ id, allow: directive.allow, deny: directive.deny }));
    });
  }
  return Object.freeze({
    async readExecutionSnapshot({ guildId }) {
      const guild = await resolveGuild(guildId);
      if (!guild) return Object.freeze({ guildExists: false, permissions: {}, rolesByKey: {}, inventory: [] });
      const permissions = guild.members?.me?.permissions;
      const rolesByKey = roleMap(guild);
      return Object.freeze({ guildExists: true, permissions: Object.freeze({ ManageChannels: Boolean(permissions?.has(PermissionFlagsBits.ManageChannels)), ManageRoles: Boolean(permissions?.has(PermissionFlagsBits.ManageRoles)), ViewChannel: Boolean(permissions?.has(PermissionFlagsBits.ViewChannel)), MoveMembers: Boolean(permissions?.has(PermissionFlagsBits.MoveMembers)) }), rolesByKey: Object.freeze(rolesByKey), inventory: Object.freeze(channelInventory(guild)) });
    },
    async createCategory({ guildId, target }) { const guild = await guildFor(guildId); const channel = await guild.channels.create({ name: target.displayName, type: ChannelType.GuildCategory, reason: 'Server governance reconciliation' }); return Object.freeze({ resourceId: channel.id }); },
    async createTextChannel({ guildId, target }) { const guild = await guildFor(guildId); const channel = await guild.channels.create({ name: target.displayName, type: ChannelType.GuildText, parent: resolveParent(guild, target.parentKey), reason: 'Server governance reconciliation' }); return Object.freeze({ resourceId: channel.id }); },
    async createVoiceChannel({ guildId, target }) { const guild = await guildFor(guildId); const channel = await guild.channels.create({ name: target.displayName, type: ChannelType.GuildVoice, parent: resolveParent(guild, target.parentKey), reason: 'Server governance reconciliation' }); return Object.freeze({ resourceId: channel.id }); },
    async moveChannel({ guildId, resourceId, parentKey }) { const guild = await guildFor(guildId); await resolveChannel(guild, resourceId).setParent(resolveParent(guild, parentKey), { lockPermissions: false }); },
    async renameChannel({ guildId, resourceId, name }) { const guild = await guildFor(guildId); await resolveChannel(guild, resourceId).setName(name, 'Server governance reconciliation'); },
    async applyCategoryPermissions({ guildId, resourceId, permission }) { const guild = await guildFor(guildId); await resolveChannel(guild, resourceId).permissionOverwrites.set(overwritePayload(guild, permission), 'Server governance permission reconciliation'); },
    async applyChannelPermissions({ guildId, resourceId, permission }) { const guild = await guildFor(guildId); await resolveChannel(guild, resourceId).permissionOverwrites.set(overwritePayload(guild, permission), 'Server governance permission reconciliation'); },
    async deleteChannel({ guildId, resourceId }) { const guild = await guildFor(guildId); await resolveChannel(guild, resourceId).delete('Server governance safe delete'); },
    async deleteCategory({ guildId, resourceId }) { const guild = await guildFor(guildId); const category = resolveChannel(guild, resourceId); if ([...guild.channels.cache.values()].some((channel) => channel.parentId === category.id)) throw Object.assign(new Error('Category still has children'), { code: 'BLOCKED_CATEGORY_NOT_EMPTY_SAFE' }); await category.delete('Server governance safe delete'); }
  });
}

module.exports = { createDiscordGuildStructureMutationGateway };
