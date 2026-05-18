const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlock')
    .setDescription('解鎖目前頻道，恢復成員發言')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      await interaction.reply({ content: '這個指令只能在伺服器頻道中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能解鎖頻道。', ephemeral: true });
      return;
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: null
    }, {
      reason: `Channel unlocked by ${interaction.user.tag}`
    });

    await interaction.reply({ content: `已解鎖 ${interaction.channel}，發言權限恢復繼承設定。` });
  }
};
