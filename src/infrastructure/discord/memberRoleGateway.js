function createMemberRoleGateway({ resolveGuild, logger = console } = {}) {
  if (typeof resolveGuild !== 'function') throw new Error('resolveGuild is required.');

  return {
    async releaseMember({ guildId, memberId, removeRoleIds = [], addRoleIds = [], reason = 'Member Guard manual release' }) {
      const guild = await resolveGuild(guildId);
      if (!guild) return { removed: [], added: [], failed: [{ action: 'resolveGuild', code: 'GUILD_NOT_FOUND' }] };
      let member;
      try { member = await guild.members.fetch(memberId); } catch (error) { return { removed: [], added: [], failed: [{ action: 'fetchMember', code: error.code || 'MEMBER_NOT_FOUND' }] }; }
      const removed = [];
      const added = [];
      const failed = [];
      for (const roleId of removeRoleIds) {
        try {
          if (member.roles.cache.has(roleId)) await member.roles.remove(roleId, reason);
          removed.push(roleId);
        } catch (error) { failed.push({ action: 'remove', roleId, code: error.code || 'REMOVE_FAILED' }); logger.warn?.('MemberGuard role removal failed:', error); }
      }
      for (const roleId of addRoleIds) {
        try {
          if (!member.roles.cache.has(roleId)) await member.roles.add(roleId, reason);
          added.push(roleId);
        } catch (error) { failed.push({ action: 'add', roleId, code: error.code || 'ADD_FAILED' }); logger.warn?.('MemberGuard role addition failed:', error); }
      }
      return { removed, added, failed, memberId };
    },
    async removeRole(input) { return this.releaseMember({ ...input, addRoleIds: [] }); },
    async addRole(input) { return this.releaseMember({ ...input, removeRoleIds: [] }); }
  };
}

module.exports = { createMemberRoleGateway };
