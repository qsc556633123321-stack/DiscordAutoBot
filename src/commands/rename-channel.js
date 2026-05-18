const {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rename-channel')
    .setDescription('改名單一指定頻道')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('要改名的頻道')
        .addChannelTypes(
          ChannelType.GuildText,
          ChannelType.GuildVoice,
          ChannelType.GuildCategory
        )
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('name')
        .setDescription('新的頻道名稱')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(100)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能改名頻道。', ephemeral: true });
      return;
    }

    const channel = interaction.options.getChannel('channel');
    const newName = interaction.options.getString('name').trim();

    if (!newName) {
      await interaction.reply({ content: '新的頻道名稱不能是空白。', ephemeral: true });
      return;
    }

    try {
      const oldName = channel.name;
      await channel.setName(newName, `Renamed by ${interaction.user.tag}`);
      await interaction.reply({
        content: `已將頻道名稱從 \`${oldName}\` 改為 \`${channel.name}\`。`,
        ephemeral: true
      });
    } catch (error) {
      console.error('改名頻道失敗：', error);
      await interaction.reply({
        content: '改名頻道失敗。請確認 Bot 具有 ManageChannels 權限，且角色位置與頻道權限足夠。',
        ephemeral: true
      });
    }
  }
};
