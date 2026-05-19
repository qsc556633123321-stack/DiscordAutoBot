const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { fixGameCategory } = require('../systems/gameChannels');

function formatList(items, emptyText = '無') {
  return items.length ? items.map((item) => `- ${item}`).join('\n') : emptyText;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fix-game-category')
    .setDescription('將指定遊戲的既有頻道搬回正確遊戲分類')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('遊戲名稱，例如 聯盟戰棋')
        .setRequired(true)
        .setMaxLength(50)
    )
    .addStringOption((option) =>
      option
        .setName('short_name')
        .setDescription('頻道短名稱，例如 tft')
        .setRequired(true)
        .setMaxLength(20)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能修復遊戲分類。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法移動頻道。', ephemeral: true });
      return;
    }

    const game = interaction.options.getString('game');
    const shortName = interaction.options.getString('short_name');

    await interaction.deferReply({ ephemeral: true });

    try {
      const result = await fixGameCategory(interaction.guild, { game, shortName });
      const warningText = result.orderingWarnings.length
        ? `\n\n排序提醒：\n${formatList(result.orderingWarnings)}`
        : '';

      await interaction.editReply(
        `已檢查遊戲分類：${result.category.name}\n\n` +
        `已移動：\n${formatList(result.moved)}\n\n` +
        `已在正確分類：\n${formatList(result.existing)}\n\n` +
        `找不到的既有頻道：\n${formatList(result.missing)}` +
        warningText
      );
    } catch (error) {
      console.error('fix-game-category failed:', error);
      await interaction.editReply(
        `修復遊戲分類失敗：${error.message || '請確認 Bot 是否具備 ManageChannels 權限。'}`
      );
    }
  }
};
