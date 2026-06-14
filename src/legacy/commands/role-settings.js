const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { getRoleSettings, updateRoleSettings } = require('../../systems/roleManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role-settings')
    .setDescription('設定自助身分組與訪客身分組連動')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addBooleanOption((option) =>
      option
        .setName('remove_guest_on_verified')
        .setDescription('領取任一正式身分組後自動移除訪客，預設 true')
    )
    .addBooleanOption((option) =>
      option
        .setName('restore_guest_if_no_roles')
        .setDescription('取消所有正式身分組後是否給回訪客，預設 false')
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageRoles)) {
      await interaction.reply({ content: '你需要 ManageRoles 權限才能修改身分組設定。', ephemeral: true });
      return;
    }

    const patch = {};
    const removeGuest = interaction.options.getBoolean('remove_guest_on_verified');
    const restoreGuest = interaction.options.getBoolean('restore_guest_if_no_roles');

    if (removeGuest !== null) patch.removeGuestOnVerified = removeGuest;
    if (restoreGuest !== null) patch.restoreGuestIfNoRoles = restoreGuest;

    const settings = Object.keys(patch).length
      ? updateRoleSettings(interaction.guild.id, patch)
      : getRoleSettings(interaction.guild.id);

    await interaction.reply({
      content:
        `身分組設定已更新：\n` +
        `remove_guest_on_verified：${settings.removeGuestOnVerified ? 'true' : 'false'}\n` +
        `restore_guest_if_no_roles：${settings.restoreGuestIfNoRoles ? 'true' : 'false'}`,
      ephemeral: true
    });
  }
};
