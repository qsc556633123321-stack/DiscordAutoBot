const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createGameRoleProvisioningFeature } = require('../../composition/gameRoleProvisioningFeature');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderGameRoleProvisioningPreview } = require('../games/gameRoleProvisioningPreviewRenderer');

const data = new SlashCommandBuilder()
  .setName('game-role-preview')
  .setDescription('Preview existing guild game roles before provisioning.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

function createGameRoleProvisioningPreviewCommand({
  createFeature = createGameRoleProvisioningFeature,
  renderPreview = renderGameRoleProvisioningPreview
} = {}) {
  return {
    data,
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      if (!interaction.guild) {
        await interaction.editReply('這個指令只能在伺服器內使用。');
        return;
      }
      if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) {
        await interaction.editReply('你需要 Administrator 權限才能預覽遊戲身分組。');
        return;
      }

      const feature = createFeature({
        resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null
      });
      const preview = await feature.gameRoleProvisioning.previewGameRoleProvisioning({
        guildId: interaction.guild.id
      });
      await interaction.editReply(renderPreview(preview));
    }
  };
}

const command = createGameRoleProvisioningPreviewCommand();

module.exports = { ...command, createGameRoleProvisioningPreviewCommand };
