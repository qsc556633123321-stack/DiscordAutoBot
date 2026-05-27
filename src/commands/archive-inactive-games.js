const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { archiveInactiveGames } = require('../systems/gameSuggestionSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('archive-inactive-games')
    .setDescription('封存 14 天無明顯活躍的動態遊戲分類')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.editReply('你需要 ManageChannels 權限才能封存遊戲分類。');
      return;
    }

    const summary = await archiveInactiveGames(interaction.guild);
    const embed = new EmbedBuilder()
      .setColor(summary.failed.length ? 0xf2c94c : 0x5865f2)
      .setTitle('📦 遊戲分類封存檢查')
      .addFields(
        { name: '已封存', value: summary.archived.join('\n') || '無', inline: false },
        { name: '略過', value: summary.skipped.slice(0, 15).join('\n') || '無', inline: false },
        { name: '失敗', value: summary.failed.join('\n') || '無', inline: false }
      )
      .setFooter({ text: '只封存，不刪除；Temp Voice、Ticket、管理後台不會被處理。' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
