const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { releaseMember } = require('../../services/security/memberGuardService');
const { safeDeferReply, safeEditReply } = require('../../utils/interactionReplies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('memberguard-release')
    .setDescription('手動解除成員的訪客限制')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('要解除限制的使用者')
        .setRequired(true)
    ),

  async execute(interaction) {
    await safeDeferReply(interaction, { ephemeral: true });

    try {
      if (!interaction.guild) {
        await safeEditReply(interaction, '這個指令只能在伺服器內使用。');
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
        await safeEditReply(interaction, '你需要 ManageGuild 權限才能解除 Member Guard 限制。');
        return;
      }

      const user = interaction.options.getUser('user', true);
      const member = await interaction.guild.members.fetch(user.id);
      await releaseMember(member);
      await safeEditReply(interaction, `已解除 ${member} 的訪客限制。`);
    } catch (error) {
      console.error('memberguard-release failed:', error);
      await safeEditReply(interaction, '⚠️ 執行失敗，請查看 console logs。');
    }
  }
};
