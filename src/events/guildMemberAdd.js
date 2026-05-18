const { Events } = require('discord.js');
const { handleGuildMemberAdd } = require('../systems/welcomeSystem');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      await handleGuildMemberAdd(member);
    } catch (error) {
      console.error('新人歡迎系統處理失敗:', error);
    }
  }
};
