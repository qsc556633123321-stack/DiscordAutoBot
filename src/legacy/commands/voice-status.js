const { ChannelType, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
  formatDuration,
  generateVoiceMoodText,
  readVoiceActivity
} = require('../../systems/voiceActivitySystem');

function activeVoiceMembers(guild) {
  const members = new Set();
  for (const channel of guild.channels.cache.values()) {
    if (channel.type !== ChannelType.GuildVoice) continue;
    for (const member of channel.members.values()) {
      if (!member.user.bot) members.add(member.id);
    }
  }
  return members.size;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-status')
    .setDescription('查看目前語音活躍與社群氣氛狀態'),

  async execute(interaction) {
    await interaction.deferReply();
    const data = readVoiceActivity()[interaction.guild.id] || { users: {}, rooms: {} };
    const users = Object.values(data.users || {});
    const totalMs = users.reduce((sum, user) => sum + (user.totalMs || 0), 0);
    const roomCreates = users.reduce((sum, user) => sum + (user.roomCreates || 0), 0);
    const activeMembers = activeVoiceMembers(interaction.guild);
    const fallback = activeMembers >= 5
      ? '現在語音區有點熱，適合揪一波。'
      : activeMembers > 0
        ? '現在有人在語音裡，可以進去打個招呼。'
        : '目前語音偏安靜，適合開第一間房帶節奏。';
    const mood = await generateVoiceMoodText('guild_status', { activeMembers, roomCreates, fallback });

    const embed = new EmbedBuilder()
      .setColor(activeMembers ? 0x57f287 : 0x2f3136)
      .setTitle('🟢 語音社群狀態')
      .setDescription(mood)
      .addFields(
        { name: '目前語音人數', value: `${activeMembers} 人`, inline: true },
        { name: '累積語音時間', value: formatDuration(totalMs), inline: true },
        { name: '累積開房次數', value: `${roomCreates} 次`, inline: true },
        { name: '已累積成員', value: `${users.length} 人`, inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
