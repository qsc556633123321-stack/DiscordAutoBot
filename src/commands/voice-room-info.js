const { ChannelType, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { formatDuration, generateVoiceMoodText, getRoomInfo } = require('../systems/voiceActivitySystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-room-info')
    .setDescription('查看目前語音房活躍資訊')
    .addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('指定語音頻道，不填則使用你目前所在語音')
        .addChannelTypes(ChannelType.GuildVoice)
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const channel = interaction.options.getChannel('channel') || interaction.member?.voice?.channel;
    if (!channel || channel.type !== ChannelType.GuildVoice) {
      await interaction.editReply('請先加入語音，或指定一個語音頻道。');
      return;
    }

    const info = getRoomInfo(interaction.guild, channel);
    const mood = await generateVoiceMoodText('room_info', {
      roomName: info.roomName,
      game: info.game,
      memberCount: info.memberCount,
      label: info.label,
      fallback: info.label
    });
    const embed = new EmbedBuilder()
      .setColor(info.isHot ? 0xf2c94c : 0x5865f2)
      .setTitle('🎤 語音房資訊')
      .setDescription(`${channel}\n${mood}`)
      .addFields(
        { name: '房主', value: info.ownerId ? `<@${info.ownerId}>` : '未記錄', inline: true },
        { name: '遊戲分類', value: info.game || '一般語音', inline: true },
        { name: '房內人數', value: `${info.memberCount}/${info.limit || '無上限'}`, inline: true },
        { name: '活躍時長', value: info.createdAt ? formatDuration(info.ageMs) : '未記錄', inline: true },
        { name: '是否熱門', value: info.isHot ? '是' : '否', inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
