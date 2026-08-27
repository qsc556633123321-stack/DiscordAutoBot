const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createServerGovernancePreviewFeature } = require('../../composition/serverGovernancePreviewFeature');
const { createServerGovernanceExecutionFeature } = require('../../composition/serverGovernanceExecutionFeature');
const { ExecutionMode } = require('../../domain/community/serverGovernanceExecutionPolicy');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderServerGovernanceDryRun } = require('../community/serverGovernanceDryRunRenderer');

const data = new SlashCommandBuilder().setName('server-governance-dry-run').setDescription('Read-only governance execution simulation.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
function createServerGovernanceDryRunCommand({ createPreviewFeature = createServerGovernancePreviewFeature, createExecutionFeature = createServerGovernanceExecutionFeature, renderDryRun = renderServerGovernanceDryRun } = {}) {
  return { data, async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild) return interaction.editReply('這個指令只能在伺服器內使用。');
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return interaction.editReply('你需要 Administrator 權限才能執行治理 dry-run。');
    const dependencies = { resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null };
    const previewFeature = createPreviewFeature(dependencies);
    const executionFeature = createExecutionFeature(dependencies);
    const inventory = await executionFeature.readGuildInventory({ guildId: interaction.guild.id });
    const preview = await previewFeature.serverGovernancePreview.previewFullGuildGovernance({ guildId: interaction.guild.id });
    const result = await executionFeature.serverGovernanceExecution.execute({ guildId: interaction.guild.id, plan: preview.plan, inventory, mode: ExecutionMode.DRY_RUN });
    return interaction.editReply(renderDryRun(result));
  } };
}
const command = createServerGovernanceDryRunCommand();
module.exports = { ...command, createServerGovernanceDryRunCommand };
