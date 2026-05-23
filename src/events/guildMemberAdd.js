const { Events } = require('discord.js');
const { handleMemberGuardJoin } = require('../systems/memberGuard');
const { handleGuildMemberAdd } = require('../systems/welcomeSystem');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      await handleMemberGuardJoin(member);
    } catch (error) {
      console.error('Member Guard guildMemberAdd 處理失敗:', error);
    }

    try {
      await handleGuildMemberAdd(member);
    } catch (error) {
      console.error('新人歡迎系統處理失敗:', error);
    }
  }
};
