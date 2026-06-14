const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const {
  formatDuration,
  generateVoiceMoodText,
  getProfile
} = require('../../systems/voiceActivitySystem');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-profile')
    .setDescription('查看自己的語音活躍與社交檔案')
    .addUserOption((option) =>
      option
        .setName('user')
        .setDescription('要查看的成員')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const user = interaction.options.getUser('user') || interaction.user;
    const profile = getProfile(interaction.guild.id, user.id);
    const topPartner = profile.topPartnerId ? `<@${profile.topPartnerId}>` : '尚未累積';
    const text = await generateVoiceMoodText('profile', {
      stats: profile,
      fallback: profile.aiText
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle('🎧 語音檔案')
      .setDescription(`${user}\n${text}`)
      .addFields(
        { name: '累積語音', value: formatDuration(profile.totalMs), inline: true },
        { name: '本週語音', value: formatDuration(profile.weekMs?.[require('../../utils/voiceStats').getWeekKey()] || 0), inline: true },
        { name: '開房次數', value: String(profile.roomCreates || 0), inline: true },
        { name: '深夜出沒', value: formatDuration(profile.lateNightMs), inline: true },
        { name: '最愛遊戲', value: profile.topGame, inline: true },
        { name: '語音稱號', value: profile.title, inline: true },
        { name: '最常一起玩', value: topPartner, inline: false }
      )
      .setFooter({ text: '只統計時間、房間、人數與共同語音，不記錄語音內容。' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
