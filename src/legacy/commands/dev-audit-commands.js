const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

function list(items, empty = 'None') {
  return items.length ? items.slice(0, 25).join('\n').slice(0, 1024) : empty;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dev-audit-commands')
    .setDescription('Audit command implementation, deployment loading, and documentation.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const { auditCommands } = require('../../../scripts/audit-commands');
    const report = auditCommands();
    const embed = new EmbedBuilder()
      .setColor(report.invalid.length || report.documentedOnly.length ? 0xf2c94c : 0x57f287)
      .setTitle('Command Implementation Audit')
      .setDescription(`Deploy loader: ${report.deployMode}\nImplemented: ${report.implemented.length}`)
      .addFields(
        { name: '✅ implemented', value: list(report.implemented.map((name) => `/${name}`)) },
        { name: '⚠️ documented only', value: list(report.documentedOnly.map((name) => `/${name}`)) },
        { name: '❌ invalid / missing deploy', value: list(report.invalid.map((item) => `${item.file}: ${item.reason}`)) },
        { name: 'Legacy / undocumented', value: list(report.undocumented.map((name) => `/${name}`)) }
      );
    await interaction.editReply({ embeds: [embed] });
  }
};
