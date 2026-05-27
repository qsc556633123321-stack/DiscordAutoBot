const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { formatDuration, getLeaderboard } = require('../systems/voiceActivitySystem');

function valueText(category, value) {
  if (category === 'room_creates' || category === 'hosts') return `${value} 次`;
  return formatDuration(value);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice-leaderboard')
    .setDescription('查看語音活躍排行榜')
    .addStringOption((option) =>
      option
        .setName('category')
        .setDescription('排行榜分類')
        .setRequired(false)
        .addChoices(
          { name: '本週語音', value: 'week' },
          { name: '本月語音', value: 'month' },
          { name: '開房次數', value: 'room_creates' },
          { name: '深夜語音', value: 'late_night' },
          { name: '最熱門房主', value: 'hosts' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const category = interaction.options.getString('category') || 'week';
    const rows = getLeaderboard(interaction.guild.id, category);
    const lines = rows.map((row, index) => (
      `**${index + 1}.** <@${row.userId}> · ${valueText(category, row.value)} · ${require('../utils/voiceStats').buildTitle(row.stats)}`
    ));

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('🏆 語音活躍排行榜')
      .setDescription(lines.length ? lines.join('\n') : '目前還沒有足夠的語音資料。')
      .setFooter({ text: 'AFK、一人掛機、Bot 不列入統計。' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
};
