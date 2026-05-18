const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lock')
    .setDescription('鎖定目前頻道，禁止成員發言')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    if (!interaction.guild || !interaction.channel) {
      await interaction.reply({ content: '這個指令只能在伺服器頻道中使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能鎖定頻道。', ephemeral: true });
      return;
    }

    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
      SendMessages: false
    }, {
      reason: `Channel locked by ${interaction.user.tag}`
    });

    await interaction.reply({ content: `已鎖定 ${interaction.channel}，一般成員暫時不能發言。` });
  }
};
