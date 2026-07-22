const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createUpsertChannelRuleUseCase } = require('../../application/memory/upsertChannelRuleUseCase');

const data = new SlashCommandBuilder()
  .setName('learn-channel')
  .setDescription('讓 Bot 學習頻道關鍵字應歸類到哪個分類')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((option) => option
    .setName('keyword')
    .setDescription('要學習的關鍵字，例如 美食、料理、股票、APEX')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(50))
  .addChannelOption((option) => option
    .setName('category')
    .setDescription('關鍵字對應的分類')
    .addChannelTypes(ChannelType.GuildCategory)
    .setRequired(true))
  .addIntegerOption((option) => option
    .setName('weight')
    .setDescription('記憶權重，預設 5')
    .setRequired(false)
    .setMinValue(1)
    .setMaxValue(10));

function createLearnChannelCommand({ useCase = createUpsertChannelRuleUseCase(), logger = console } = {}) {
  return {
    data,
    async execute(interaction) {
      if (!interaction.guild) {
        await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能讓 Bot 學習分類規則。', ephemeral: true });
        return;
      }
      const keyword = interaction.options.getString('keyword');
      const category = interaction.options.getChannel('category');
      const weight = interaction.options.getInteger('weight') || 5;
      try {
        const result = useCase.execute({ guildId: interaction.guild.id, keyword, category: category.name, weight });
        if (!result.ok) throw new Error(result.error.message);
        const rule = result.data;
        await interaction.reply({
          content: `學習成功：之後頻道名稱命中 \`${rule.keyword}\` 時，會對 \`${rule.category}\` 加上 ${rule.weight} 分。`,
          ephemeral: true
        });
      } catch (error) {
        logger.error('學習分類規則失敗：', error);
        await interaction.reply({ content: `學習失敗：${error.message}`, ephemeral: true });
      }
    }
  };
}

const command = createLearnChannelCommand();

module.exports = { ...command, createLearnChannelCommand };
