const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { releaseMember } = require('../systems/memberGuard');

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
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能解除 Member Guard 限制。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const user = interaction.options.getUser('user', true);
      const member = await interaction.guild.members.fetch(user.id);
      await releaseMember(member);
      await interaction.editReply(`已解除 ${member} 的訪客限制。`);
    } catch (error) {
      console.error('memberguard-release failed:', error);
      await interaction.editReply(`解除限制失敗：${error.message}`);
    }
  }
};
