const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder
} = require('discord.js');
const {
  buildRestoreActiveChannelsPlan,
  saveRestoreActiveChannelsPlan
} = require('../systems/activeChannelProtector');

function truncate(value, max = 1024) {
  if (!value) return '無';
  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function formatMoves(moves) {
  if (!moves.length) return '無';
  return moves
    .map((move) => `• ${move.channelName}: ${move.currentCategoryName} -> ${move.targetCategoryName}｜${move.reason}`)
    .join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('restore-active-channels')
    .setDescription('將誤封存的有效生活/遊戲頻道移回正確分類')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('preview 只預覽；execute 需確認後移動')
        .setRequired(true)
        .addChoices(
          { name: 'preview', value: 'preview' },
          { name: 'execute', value: 'execute' }
        )
    ),

  async execute(interaction) {
    if (!interaction.guild) {
      await interaction.reply({ content: '這個指令只能在伺服器內使用。', ephemeral: true });
      return;
    }

    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: '你需要 ManageChannels 權限才能修復封存頻道。', ephemeral: true });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
      await interaction.reply({ content: 'Bot 缺少 ManageChannels 權限，無法移動頻道。', ephemeral: true });
      return;
    }

    const mode = interaction.options.getString('mode');
    const plan = buildRestoreActiveChannelsPlan(interaction.guild, {
      mode,
      requestedById: interaction.user.id,
      onlyArchived: true
    });
    saveRestoreActiveChannelsPlan(interaction.id, plan);

    const embed = new EmbedBuilder()
      .setColor(0x57f287)
      .setTitle('有效頻道還原預覽')
      .setDescription('只會移動誤放在舊頻道封存的有效頻道，不會刪除、不會改名、不會修改權限。')
      .addFields(
        { name: '將移動的頻道', value: truncate(formatMoves(plan.moves)) },
        { name: '略過', value: truncate(plan.skipped.map((item) => `• ${item.channelName}：${item.reason}`).join('\n') || '無') }
      )
      .setFooter({ text: `Plan ID: ${interaction.id}` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`restore_active_confirm_${interaction.id}`)
        .setLabel('確認還原')
        .setStyle(ButtonStyle.Success)
        .setDisabled(mode !== 'execute'),
      new ButtonBuilder()
        .setCustomId(`restore_active_cancel_${interaction.id}`)
        .setLabel('取消')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
