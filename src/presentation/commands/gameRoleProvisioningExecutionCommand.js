const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createGameRoleProvisioningFeature } = require('../../composition/gameRoleProvisioningFeature');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderGameRoleProvisioningExecution } = require('../games/gameRoleProvisioningExecutionRenderer');

const CONFIRMATION = 'CREATE_GAME_ROLES';
const data = new SlashCommandBuilder()
  .setName('game-role-provision')
  .setDescription('Explicitly create missing registry game roles.')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) => option.setName('confirm').setDescription('Type CREATE_GAME_ROLES exactly.').setRequired(true));

function createGameRoleProvisioningExecutionCommand({
  createFeature = createGameRoleProvisioningFeature,
  renderExecution = renderGameRoleProvisioningExecution
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
        await interaction.editReply('你需要 Administrator 權限才能建立遊戲身分組。');
        return;
      }
      if (interaction.options?.getString?.('confirm') !== CONFIRMATION) {
        await interaction.editReply('確認字串不正確。請輸入 CREATE_GAME_ROLES。');
        return;
      }

      const feature = createFeature({
        resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null
      });
      const service = feature.gameRoleProvisioning;
      const preview = await service.previewGameRoleProvisioning({ guildId: interaction.guild.id });
      if (preview.conflicts.length) {
        await interaction.editReply(renderExecution({ status: 'blocked', preview }));
        return;
      }
      if (!preview.wouldCreate.length) {
        await interaction.editReply(renderExecution({ status: 'nothing', preview }));
        return;
      }
      const result = await service.provisionGameRoles({ guildId: interaction.guild.id });
      await interaction.editReply(renderExecution({ status: result.ok ? 'complete' : 'failed', preview, result }));
    }
  };
}

const command = createGameRoleProvisioningExecutionCommand();

module.exports = { CONFIRMATION, ...command, createGameRoleProvisioningExecutionCommand };
