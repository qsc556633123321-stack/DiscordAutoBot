const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { buildLayoutDoctorReport } = require('../systems/layoutDecisionEngine');

function list(items, empty = '無') {
  return items.length ? items.slice(0, 12).join('\n').slice(0, 1024) : empty;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('layout-doctor')
    .setDescription('深度掃描 layout 權限、重複、缺少、封存與可刪除候選')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能檢查 layout。');
      return;
    }

    const report = buildLayoutDoctorReport(interaction.guild);
    const actions = report.plan.actions;
    const embed = new EmbedBuilder()
      .setColor(actions.some((item) => item.risk === 'high') ? 0xf2c94c : 0x57f287)
      .setTitle('🩺 Layout Doctor')
      .setDescription('這裡只做分析，不會修改伺服器。要執行修復請使用 `/ai-layout-repair` 或 `/repair-channel-permissions`。')
      .addFields(
        { name: 'visibilityType 狀態', value: list(report.visibility), inline: false },
        { name: '子頻道未同步分類', value: list(report.unsynced), inline: false },
        { name: '建議修權限', value: list(actions.filter((item) => item.action === 'sync_permission').map((item) => `${item.targetName}: ${item.reason}`)), inline: false },
        { name: '建議改名', value: list(actions.filter((item) => item.action === 'rename').map((item) => `${item.targetName} -> ${item.newName}`)), inline: false },
        { name: '建議搬移', value: list(actions.filter((item) => item.action === 'move').map((item) => `${item.targetName} -> ${item.targetCategoryKey}`)), inline: false },
        { name: '建議封存候選', value: list(actions.filter((item) => item.action === 'archive').map((item) => `${item.targetName}: ${item.reason}`)), inline: false },
        { name: '可刪除候選', value: list(actions.filter((item) => item.action === 'delete').map((item) => `${item.targetName}: ${item.reason}`)), inline: false },
        { name: '不處理 protected', value: list(actions.filter((item) => item.action === 'keep').map((item) => `${item.targetName}: ${item.reason}`)), inline: false }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
