const { SlashCommandBuilder } = require('discord.js');
const { createHelpMeStartFeature } = require('../../composition/community/helpMeStartFeature');
const { createHelpMeStartEmbed } = require('../community/helpMeStartEmbed');

const data = new SlashCommandBuilder()
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
  );

function createHelpMeStartCommand({ featureFactory = createHelpMeStartFeature, clock } = {}) {
  return {
    data,
    async execute(interaction) {
      await interaction.deferReply({ ephemeral: true });
      const answers = {
        game: interaction.options.getString('game') || '',
        style: interaction.options.getString('style') || 'chat',
        onlineTime: interaction.options.getString('online_time') || 'mixed'
      };
      const useCase = featureFactory({ guild: interaction.guild }).getHelpMeStartRecommendation;
      const result = await useCase.execute({
        guildId: interaction.guild.id,
        guildName: interaction.guild.name,
        answers
      });
      await interaction.editReply({
        embeds: [createHelpMeStartEmbed({
          description: result.description,
          recommendation: result.recommendation,
          timestamp: clock?.()
        })]
      });
    }
  };
}

const command = createHelpMeStartCommand();

module.exports = { ...command, createHelpMeStartCommand };
