const { ChannelType } = require('discord.js');

function serializeOverwrites(channel) { return [...(channel.permissionOverwrites?.cache?.values?.() || [])].map((item) => ({ id: item.id, type: item.type, allow: item.allow?.bitfield?.toString() || '0', deny: item.deny?.bitfield?.toString() || '0' })); }

function createDiscordGuildSnapshotAdapter({ resolveGuild, resolveGameCanonicalId = () => null, now = () => new Date().toISOString() } = {}) {
  if (typeof resolveGuild !== 'function') throw new TypeError('resolveGuild is required');
  return Object.freeze({ async readGuildSnapshot({ guildId }) { const guild = await resolveGuild(guildId); const [fetchedChannels, fetchedRoles] = await Promise.all([guild.channels.fetch(), guild.roles.fetch()]); const channels = [...fetchedChannels.values()].filter(Boolean).map((channel) => ({ id: channel.id, name: channel.name, type: ChannelType[channel.type] || String(channel.type), rawType: channel.type, parentId: channel.parentId || null, position: channel.rawPosition ?? 0, gameCanonicalId: resolveGameCanonicalId(channel), permissionOverwrites: serializeOverwrites(channel) })); const roles = [...fetchedRoles.values()].filter(Boolean).map((role) => ({ id: role.id, name: role.name, position: role.position })); return Object.freeze({ guildId: guild.id, capturedAt: now(), categories: channels.filter((channel) => channel.rawType === ChannelType.GuildCategory), channels: channels.filter((channel) => channel.rawType !== ChannelType.GuildCategory), roles }); } });
}
module.exports = { createDiscordGuildSnapshotAdapter };
