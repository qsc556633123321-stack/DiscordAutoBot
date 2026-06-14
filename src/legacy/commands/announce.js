const {
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('以 Embed 發送公告')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption((option) =>
      option
        .setName('title')
        .setDescription('公告標題')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('公告內容')
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('要發送到哪個文字頻道，預設為目前頻道')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      await interaction.reply({ content: '你需要 ManageGuild 權限才能發公告。', ephemeral: true });
      return;
    }

    const title = interaction.options.getString('title');
    const message = interaction.options.getString('message');
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await interaction.reply({ content: '請選擇有效的文字頻道。', ephemeral: true });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x2f80ed)
      .setTitle(title)
      .setDescription(message)
      .setFooter({ text: `發布者：${interaction.user.tag}` })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });
    await interaction.reply({ content: `公告已發送到 ${targetChannel}。`, ephemeral: true });
  }
};
