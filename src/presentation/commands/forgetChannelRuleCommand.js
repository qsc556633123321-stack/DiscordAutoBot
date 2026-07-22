const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createMemoryFeature } = require('../../composition/memoryFeature');

const data = new SlashCommandBuilder()
  .setName('forget-channel-rule')
  .setDescription('刪除一筆已學習的頻道分類規則')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
  .addStringOption((option) => option
    .setName('keyword')
    .setDescription('要刪除的關鍵字')
    .setRequired(true)
    .setMinLength(1)
    .setMaxLength(50));

function createForgetChannelRuleCommand({ feature, useCase, logger = console } = {}) {
  const resolvedUseCase = useCase || feature?.deleteChannelRule || createMemoryFeature().deleteChannelRule;
  return {
    data,
    async execute(interaction) {
      if (!interaction.guild) {
        await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能刪除記憶規則。', ephemeral: true });
        return;
      }
      const keyword = interaction.options.getString('keyword');
      try {
        const result = resolvedUseCase.execute({ guildId: interaction.guild.id, keyword });
        if (!result.ok) throw new Error(result.error.message);
        await interaction.reply({
          content: result.data.deleted
            ? `已刪除關鍵字 \`${keyword}\` 的記憶規則。`
            : `找不到關鍵字 \`${keyword}\` 的記憶規則。`,
          ephemeral: true
        });
      } catch (error) {
        logger.error('刪除記憶規則失敗：', error);
        await interaction.reply({ content: `刪除記憶規則失敗：${error.message}`, ephemeral: true });
      }
    }
  };
}

const command = createForgetChannelRuleCommand();

module.exports = { ...command, createForgetChannelRuleCommand };
