const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createServerGovernanceReviewFeature } = require('../../composition/serverGovernanceReviewFeature');
const { hasPermission } = require('../../modules/interactions/permissionGuard');
const { renderReviewEntries, renderReviewItem, renderReviewSummary } = require('../community/serverGovernanceReviewDecisionRenderer');

const data = new SlashCommandBuilder().setName('server-governance-review').setDescription('Review and persist governance decisions.').setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addStringOption((option) => option.setName('action').setDescription('Review action').setRequired(true).addChoices(
    { name: 'list', value: 'list' }, { name: 'show', value: 'show' }, { name: 'decide', value: 'decide' }, { name: 'reset', value: 'reset' }, { name: 'summary', value: 'summary' }, { name: 'bulk-ignore-unknown', value: 'bulk-ignore-unknown' }
  ))
  .addStringOption((option) => option.setName('resource-id').setDescription('Review resource ID'))
  .addStringOption((option) => option.setName('decision').setDescription('Decision').addChoices(
    { name: 'KEEP', value: 'KEEP' }, { name: 'DELETE', value: 'DELETE' }, { name: 'ADOPT_CANONICAL', value: 'ADOPT_CANONICAL' }, { name: 'IGNORE_GOVERNANCE', value: 'IGNORE_GOVERNANCE' }
  ))
  .addStringOption((option) => option.setName('canonical-target').setDescription('Canonical target key for adoption'))
  .addStringOption((option) => option.setName('filter').setDescription('List filter').addChoices(
    { name: 'undecided', value: 'undecided' }, { name: 'review-delete', value: 'review-delete' }, { name: 'unknown', value: 'unknown' }, { name: 'game', value: 'game' }, { name: 'category', value: 'category' }, { name: 'channel', value: 'channel' }, { name: 'stale', value: 'stale' }
  ))
  .addIntegerOption((option) => option.setName('page').setDescription('Page').setMinValue(1))
  .addStringOption((option) => option.setName('confirmation').setDescription('Exact bulk confirmation'));

function createServerGovernanceReviewCommand({ createFeature = createServerGovernanceReviewFeature } = {}) {
  return { data, async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    if (!interaction.guild) return interaction.editReply('這個指令只能在伺服器內使用。');
    const action = interaction.options.getString('action', true);
    const canAdminister = interaction.guild.ownerId === interaction.user.id || hasPermission(interaction, PermissionFlagsBits.Administrator);
    const canView = canAdminister || hasPermission(interaction, PermissionFlagsBits.ManageGuild);
    if (!canView) return interaction.editReply('你需要 Manage Guild、Administrator 或伺服器擁有者權限才能查看治理審查。');
    if (['decide', 'reset', 'bulk-ignore-unknown'].includes(action) && !canAdminister) return interaction.editReply('你需要伺服器擁有者或 Administrator 權限才能變更治理審查決策。');
    const feature = createFeature({ resolveGuild: async (guildId) => guildId === interaction.guild.id ? interaction.guild : null });
    const input = { guildId: interaction.guild.id, actorId: interaction.user.id, resourceId: interaction.options.getString('resource-id'), decision: interaction.options.getString('decision'), canonicalTargetKey: interaction.options.getString('canonical-target'), confirmation: interaction.options.getString('confirmation') };
    let result;
    if (action === 'decide') {
      if (!input.resourceId || !input.decision) return interaction.editReply('decide 需要 resource-id 與 decision。');
      result = await feature.serverGovernanceReview.decide(input);
    } else if (action === 'reset') {
      if (!input.resourceId) return interaction.editReply('reset 需要 resource-id。');
      result = await feature.serverGovernanceReview.reset(input);
    } else if (action === 'bulk-ignore-unknown') result = await feature.serverGovernanceReview.bulkIgnoreUserManaged(input);
    else result = await feature.serverGovernanceReview.inspect(input);
    const manifest = result.preview.reviewManifest;
    if (action === 'list') return interaction.editReply(renderReviewEntries(manifest, { filter: interaction.options.getString('filter') || 'all', page: interaction.options.getInteger('page') || 1 }));
    if (action === 'show') return interaction.editReply(renderReviewItem(manifest.entries.find((entry) => entry.resourceId === input.resourceId)));
    return interaction.editReply(renderReviewSummary(result.review));
  } };
}

const command = createServerGovernanceReviewCommand();
module.exports = { ...command, createServerGovernanceReviewCommand };
