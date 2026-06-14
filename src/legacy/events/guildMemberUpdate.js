const { Events } = require('discord.js');
const { syncMemberRoleInheritance } = require('../../systems/roleManager');

module.exports = {
  name: Events.GuildMemberUpdate,

  async execute(oldMember, newMember) {
    if (newMember.user.bot || oldMember.roles.cache.size === newMember.roles.cache.size) return;
    try {
      const result = await syncMemberRoleInheritance(newMember, 'Sync inherited role after member role update');
      if (result.failed.length) console.warn('[RoleInheritance]', result.failed.join('; '));
    } catch (error) {
      console.error('[RoleInheritance] sync failed:', error);
    }
  }
};
