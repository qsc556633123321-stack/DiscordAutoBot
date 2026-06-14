const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const {
  buildTempVoiceControlPayload,
  getTempVoiceRecord,
  isTempVoice
} = require('../../systems/tempVoice');

function findOwnedTempVoice(guild, userId) {
  return guild.channels.cache.find((channel) => {
    if (channel.type !== ChannelType.GuildVoice) return false;
    const record = getTempVoiceRecord(guild.id, channel.id);
    return record && record.ownerId === userId;
  }) || null;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tempvoice-panel')
    .setDescription('重新取得自己的臨時語音房控制台')
    .addChannelOption((option) =>
      option
        .setName('voice_channel')
        .setDescription('管理員可指定臨時語音頻道')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(false)
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    const selectedChannel = interaction.options.getChannel('voice_channel');
    let channel = selectedChannel || findOwnedTempVoice(interaction.guild, interaction.user.id);

    if (selectedChannel && !interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '只有管理員可以指定其他語音房取得控制台。', ephemeral: true });
      return;
    }

    if (!channel && interaction.member.voice.channel && isTempVoice(interaction.guild.id, interaction.member.voice.channel.id)) {
      channel = interaction.member.voice.channel;
    }

    if (!channel || !isTempVoice(interaction.guild.id, channel.id)) {
      await interaction.reply({ content: '找不到你擁有的臨時語音房。', ephemeral: true });
      return;
    }

    const record = getTempVoiceRecord(interaction.guild.id, channel.id);
    if (
      record.ownerId !== interaction.user.id &&
      !interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)
    ) {
      await interaction.reply({ content: '只有房主或管理員可以取得這個控制台。', ephemeral: true });
      return;
    }

    const payload = buildTempVoiceControlPayload(channel);
    if (!payload) {
      await interaction.reply({ content: '此語音房控制台已不存在或房間已結束。', ephemeral: true });
      return;
    }

    await interaction.reply({
      content: `這是 ${channel} 的私有控制台。`,
      ...payload,
      ephemeral: true
    });
  }
};
