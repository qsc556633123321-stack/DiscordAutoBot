const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { createListChannelRulesUseCase } = require('../../application/memory/listChannelRulesUseCase');

const data = new SlashCommandBuilder()
  .setName('memory-list')
  .setDescription('顯示目前伺服器已學習的頻道分類規則')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

function createMemoryListCommand({ useCase = createListChannelRulesUseCase(), logger = console } = {}) {
  return {
    data,
    async execute(interaction) {
      if (!interaction.guild) {
        await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
        return;
      }
      if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
        await interaction.reply({ content: '你需要 ManageChannels 權限才能查看記憶規則。', ephemeral: true });
        return;
      }
      try {
        const rules = useCase.execute({ guildId: interaction.guild.id });
        const description = rules.length
          ? rules.map((rule, index) => `**${index + 1}.** \`${rule.keyword}\` -> \`${rule.category}\`（+${rule.weight}）`).join('\n')
          : '目前尚未學習任何頻道分類規則。';
        const embed = new EmbedBuilder()
          .setColor(0x2f80ed)
          .setTitle('伺服器記憶規則')
          .setDescription(description)
          .setFooter({ text: '最多顯示 25 筆。' })
          .setTimestamp();
        await interaction.reply({ embeds: [embed], ephemeral: true });
      } catch (error) {
        logger.error('讀取記憶規則失敗：', error);
        await interaction.reply({ content: `讀取記憶規則失敗：${error.message}`, ephemeral: true });
      }
    }
  };
}

const command = createMemoryListCommand();

module.exports = { ...command, createMemoryListCommand };
