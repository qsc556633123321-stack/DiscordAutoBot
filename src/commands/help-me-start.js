const { SlashCommandBuilder } = require('discord.js');
const { buildHelpMeStartEmbed } = require('../systems/interactiveGuideSystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help-me-start')
    .setDescription('用幾個問題快速推薦你該去哪裡開始')
    .addStringOption((option) =>
      option
        .setName('game')
        .setDescription('你通常玩什麼？例如 TFT、LOL、APEX、Minecraft')
        .setRequired(false)
        .setMaxLength(80)
    )
    .addStringOption((option) =>
      option
        .setName('style')
        .setDescription('你比較喜歡哪種社群玩法？')
        .setRequired(false)
        .addChoices(
          { name: '上分', value: 'rank' },
          { name: '閒聊', value: 'chat' },
          { name: '深夜掛語音', value: 'night' },
          { name: '技術討論', value: 'tech' }
        )
    )
    .addStringOption((option) =>
      option
        .setName('online_time')
        .setDescription('你通常幾點上線？')
        .setRequired(false)
        .addChoices(
          { name: '白天', value: 'day' },
          { name: '晚上', value: 'evening' },
          { name: '深夜', value: 'late' },
          { name: '不固定', value: 'mixed' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const embed = await buildHelpMeStartEmbed(interaction.guild, {
      game: interaction.options.getString('game') || '',
      style: interaction.options.getString('style') || 'chat',
      onlineTime: interaction.options.getString('online_time') || 'mixed'
    });
    await interaction.editReply({ embeds: [embed] });
  }
};
