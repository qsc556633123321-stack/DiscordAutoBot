const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { applyPanelToChannel } = require('../systems/channelPanels');
const { findRoleChannel, setupSelfAssignableRoles } = require('../systems/roleManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('建立自助領取身分組並發送身分組面板')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: '你需要 ManageRoles 權限才能設定身分組。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: 'Bot 缺少 ManageRoles 權限，無法建立或管理身分組。', ephemeral: true });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await setupSelfAssignableRoles(interaction.guild);
      const roleChannel = findRoleChannel(interaction.guild) || interaction.channel;
      const panelResult = await applyPanelToChannel(
        interaction.client,
        interaction.guild,
        roleChannel,
        'role_select',
        'create'
      );

      await interaction.editReply(
        `身分組設定完成。\n` +
        `新建立：${result.created.length ? result.created.join('、') : '無'}\n` +
        `已存在：${result.existing.length ? result.existing.join('、') : '無'}\n` +
        `面板狀態：${panelResult.status}，頻道：${roleChannel}`
      );
    } catch (error) {
      console.error('設定身分組失敗:', error);
      await interaction.editReply(`設定身分組失敗：${error.message}`);
    }
  }
};
