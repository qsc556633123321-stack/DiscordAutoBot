const { PermissionFlagsBits } = require('discord.js');

const GUEST_ALLOWED_PATTERNS = [/新人報到|welcome|報到/i, /社群規則|規則|rules/i, /身分組領取|身分組|roles/i, /伺服器導覽|導覽|guide/i, /客服支援|開啟客服單|ticket|support/i];

function createMemberGuardPermissionGateway({ resolveGuild, logger = console } = {}) {
  if (typeof resolveGuild !== 'function') throw new Error('resolveGuild is required.');

  return {
    async applyGuestRestrictionsToGuild({ guildId, guestRoleId, reason = 'Member Guard guest lockdown' }) {
      const guild = await resolveGuild(guildId);
      if (!guild) return { updated: 0, skipped: 0, warning: 'GUILD_NOT_FOUND' };
      if (!guestRoleId) return { updated: 0, skipped: 0, warning: 'GUEST_ROLE_NOT_CONFIGURED' };
      if (!guild.members?.me?.permissions?.has(PermissionFlagsBits.ManageChannels)) {
        return { updated: 0, skipped: 0, warning: 'MISSING_MANAGE_CHANNELS' };
      }
      let updated = 0;
      let skipped = 0;
      for (const channel of guild.channels.cache.values()) {
        const name = `${channel?.name || ''} ${channel?.parent?.name || ''}`;
        const allowed = GUEST_ALLOWED_PATTERNS.some((pattern) => pattern.test(name));
        try {
          await channel.permissionOverwrites.edit(guestRoleId, allowed
            ? { ViewChannel: true, ReadMessageHistory: true }
            : { ViewChannel: false }, { reason });
          updated += 1;
        } catch (error) {
          skipped += 1;
          logger.warn?.('MemberGuard permission overwrite failed:', error);
        }
      }
      return { updated, skipped };
    },
    async applyGuestRestrictionsToChannels(input) {
      return this.applyGuestRestrictionsToGuild(input);
    }
  };
}

module.exports = { createMemberGuardPermissionGateway };
