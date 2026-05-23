const { Events } = require('discord.js');
const { handleAnnouncementMessage } = require('../systems/announcementPin');
const { handleAutoModMessage } = require('../systems/autoMod');
const { handleMemberGuardMessage } = require('../systems/memberGuard');

module.exports = {
  name: Events.MessageCreate,

  async execute(message) {
    try {
      const handledByMemberGuard = await handleMemberGuardMessage(message);
      if (handledByMemberGuard) return;
    } catch (error) {
      console.error('Member Guard messageCreate 處理失敗:', error);
    }

    try {
      const handledByAutoMod = await handleAutoModMessage(message);
      if (handledByAutoMod) return;
    } catch (error) {
      console.error('AutoMod messageCreate 處理失敗:', error);
    }

    try {
      await handleAnnouncementMessage(message);
    } catch (error) {
      console.error('公告自動置頂 messageCreate 處理失敗:', error);
    }
  }
};
