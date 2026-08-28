function toInventoryType(channel) { return channel?.type === 4 || channel?.type === 'category' ? 'category' : channel?.type === 2 || channel?.type === 'voice' ? 'voice' : 'text'; }
function toIdentityResource(channel) { return { id: channel.id, name: channel.name, type: toInventoryType(channel), parentId: channel.parentId || null }; }
function createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource = () => ({}), classifyInventory } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('DiscordGuildChannelInventoryAdapter requires resolveGuild');
  return Object.freeze({ async readGuildInventory({ guildId } = {}) {
    const guild = await resolveGuild(guildId);
    if (!guild) throw Object.assign(new Error('Guild not found'), { code: 'GUILD_NOT_FOUND' });
    const channels = [...guild.channels.cache.values()];
    const stableClassifications = Object.fromEntries(channels.map((channel) => [channel.id, classifyResource(channel) || {}]));
    const resolvedClassifications = typeof classifyInventory === 'function' ? classifyInventory(channels.map(toIdentityResource), stableClassifications) || {} : {};
    return Object.freeze(channels.map((channel) => {
      const classification = { ...(stableClassifications[channel.id] || {}), ...(resolvedClassifications[channel.id] || {}) };
      const overwrites = channel.permissionOverwrites?.cache?.values?.() || [];
      return Object.freeze({ id: channel.id, name: channel.name, type: toInventoryType(channel), parentId: channel.parentId || null, parentCanonicalKey: classification.parentCanonicalKey || null, position: channel.position, permissionSummary: Object.freeze([...overwrites].map((overwrite) => Object.freeze({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow?.bitfield?.toString?.() || '', deny: overwrite.deny?.bitfield?.toString?.() || '' }))), managed: Boolean(channel.managed), runtime: Boolean(classification.runtime), canonicalKey: classification.canonicalKey || null, purpose: classification.purpose || 'unknown', owner: classification.owner || 'UNKNOWN', lifecycle: classification.lifecycle || 'unknown', accessProfile: classification.accessProfile || null, accessRoleKey: classification.accessRoleKey || null, replacementKey: classification.replacementKey || null, migrationReviewReason: classification.migrationReviewReason || null });
    }));
  } });
}
module.exports = { createDiscordGuildChannelInventoryAdapter };
