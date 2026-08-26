const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createServerGovernancePreviewFeature } = require('../../composition/serverGovernancePreviewFeature');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderServerGovernancePreview } = require('../community/serverGovernancePreviewRenderer');

const data = new SlashCommandBuilder().setName('server-governance-preview').setDescription('Read-only full server governance preview.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
function createServerGovernancePreviewCommand({ createFeature = createServerGovernancePreviewFeature, renderPreview = renderServerGovernancePreview } = {}) {
  return { data, async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild) return interaction.editReply('這個指令只能在伺服器內使用。');
    if (!hasPermission(interaction, PermissionFlagsBits.Administrator)) return interaction.editReply('你需要 Administrator 權限才能預覽伺服器治理計畫。');
    const feature = createFeature({ resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null });
    const preview = await feature.serverGovernancePreview.previewFullGuildGovernance({ guildId: interaction.guild.id });
    const pages = renderPreview(preview);
    await interaction.editReply(pages[0]);
    for (const page of pages.slice(1)) await interaction.followUp({ ...page, flags: MessageFlags.Ephemeral });
  } };
}
const command = createServerGovernancePreviewCommand();
module.exports = { ...command, createServerGovernancePreviewCommand };
