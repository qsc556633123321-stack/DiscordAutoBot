const { Events } = require('discord.js');
const { handleMemberGuardJoin } = require('../systems/memberGuard');
const { handleGuildMemberAdd } = require('../systems/welcomeSystem');
const { sendConciergeWelcome } = require('../systems/communityConcierge');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      await handleMemberGuardJoin(member);
    } catch (error) {
      console.error('Member Guard guildMemberAdd failed:', error);
    }

    try {
      await handleGuildMemberAdd(member);
    } catch (error) {
      console.error('Welcome system guildMemberAdd failed:', error);
    }

    try {
      await sendConciergeWelcome(member);
    } catch (error) {
      console.error('Community concierge welcome failed:', error);
    }
  }
};
