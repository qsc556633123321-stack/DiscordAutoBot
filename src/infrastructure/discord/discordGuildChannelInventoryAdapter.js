function toInventoryType(channel) { return channel?.type === 4 || channel?.type === 'category' ? 'category' : channel?.type === 2 || channel?.type === 'voice' ? 'voice' : 'text'; }
function createDiscordGuildChannelInventoryAdapter({ resolveGuild, classifyResource = () => ({}) } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('DiscordGuildChannelInventoryAdapter requires resolveGuild');
  return Object.freeze({ async readGuildInventory({ guildId } = {}) {
    const guild = await resolveGuild(guildId);
    if (!guild) throw Object.assign(new Error('Guild not found'), { code: 'GUILD_NOT_FOUND' });
    return Object.freeze([...guild.channels.cache.values()].map((channel) => {
      const classification = classifyResource(channel) || {};
      const overwrites = channel.permissionOverwrites?.cache?.values?.() || [];
      return Object.freeze({ id: channel.id, name: channel.name, type: toInventoryType(channel), parentId: channel.parentId || null, parentCanonicalKey: classification.parentCanonicalKey || null, position: channel.position, permissionSummary: Object.freeze([...overwrites].map((overwrite) => Object.freeze({ id: overwrite.id, type: overwrite.type, allow: overwrite.allow?.bitfield?.toString?.() || '', deny: overwrite.deny?.bitfield?.toString?.() || '' }))), managed: Boolean(channel.managed), runtime: Boolean(classification.runtime), canonicalKey: classification.canonicalKey || null, purpose: classification.purpose || 'unknown', owner: classification.owner || 'UNKNOWN', lifecycle: classification.lifecycle || 'unknown', accessProfile: classification.accessProfile || null, accessRoleKey: classification.accessRoleKey || null, replacementKey: classification.replacementKey || null });
    }));
  } });
}
module.exports = { createDiscordGuildChannelInventoryAdapter };
