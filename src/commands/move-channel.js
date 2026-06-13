const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const channelMutationService = require('../services/community/channelMutationService');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('move-channel')
    .setDescription('移動單一指定頻道到目標分類')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('要移動的頻道')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildVoice
        )
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('category')
        .setDescription('目標分類')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能移動頻道。', ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel');
    const category = interaction.options.getChannel('category');

    try {
      const oldCategoryName = channel.parent ? channel.parent.name : '無分類';
      const result = await channelMutationService.move(channel, category.id, interaction.user.tag);
      if (!result.ok) throw new Error(result.error.message);

      await interaction.reply({
        content: `已將 ${channel} 從 \`${oldCategoryName}\` 移動到 \`${category.name}\`。`,
        ephemeral: true
      });
    } catch (error) {
      console.error('移動頻道失敗：', error);
      await interaction.reply({
        content: '移動頻道失敗。請確認 Bot 具有 ManageChannels 權限，且角色位置與頻道權限足夠。',
        ephemeral: true
      });
    }
  }
};
