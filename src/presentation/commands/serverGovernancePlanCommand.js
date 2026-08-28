const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createServerGovernanceApprovedPlanFeature } = require('../../composition/serverGovernanceApprovedPlanFeature');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderApprovedPlan, renderPlanVerification } = require('../community/serverGovernanceApprovedPlanRenderer');
const data = new SlashCommandBuilder().setName('server-governance-plan').setDescription('Compile and verify immutable governance plans.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator).addStringOption((option) => option.setName('action').setDescription('Plan action').setRequired(true).addChoices({ name: 'compile', value: 'compile' }, { name: 'show', value: 'show' }, { name: 'verify', value: 'verify' }));
function createServerGovernancePlanCommand({ createFeature = createServerGovernanceApprovedPlanFeature } = {}) {
  return { data, async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild) return interaction.editReply('這個指令只能在伺服器內使用。');
    if (interaction.guild.ownerId !== interaction.user.id && !hasPermission(interaction, PermissionFlagsBits.Administrator)) return interaction.editReply('你需要伺服器擁有者或 Administrator 權限才能編譯治理計畫。');
    const feature = createFeature({ resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null });
    const action = interaction.options.getString('action', true);
    if (action === 'compile') { const result = await feature.serverGovernanceApprovedPlan.compile({ guildId: interaction.guild.id, actorId: interaction.user.id }); return interaction.editReply(renderApprovedPlan(result.plan)); }
    if (action === 'verify') return interaction.editReply(renderPlanVerification(await feature.serverGovernanceApprovedPlan.verify({ guildId: interaction.guild.id, actorId: interaction.user.id })));
    return interaction.editReply(renderApprovedPlan(feature.serverGovernanceApprovedPlan.latest({ guildId: interaction.guild.id })?.plan));
  } };
}
const command = createServerGovernancePlanCommand();
module.exports = { ...command, createServerGovernancePlanCommand };
