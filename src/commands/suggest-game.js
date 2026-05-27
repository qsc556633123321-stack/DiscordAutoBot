const { SlashCommandBuilder } = require('discord.js');
const { createGameSuggestion } = require('../systems/gameSuggestionSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('suggest-game')
    .setDescription('提議新增一個遊戲分類')
    .addStringOption((option) =>
      option
        .setName('game_name')
        .setDescription('遊戲名稱，例如 R.E.P.O')
        .setRequired(true)
        .setMaxLength(80)
    )
    .addStringOption((option) =>
      option
        .setName('reason')
        .setDescription('為什麼想新增這個遊戲分類')
        .setRequired(true)
        .setMaxLength(500)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const gameName = interaction.options.getString('game_name', true).trim();
    const reason = interaction.options.getString('reason', true).trim();

    if (gameName.length < 2) {
      await interaction.editReply('遊戲名稱太短，請輸入更清楚的名稱。');
      return;
    }

    const { channel } = await createGameSuggestion(interaction, gameName, reason);
    await interaction.editReply(`已送出遊戲分類提議，請到 ${channel} 查看與投票。`);
  }
};
